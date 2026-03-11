import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const threeDaysOut = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    // 1. Find reminders due today or tomorrow (not checked, not snoozed past now)
    const { data: dueReminders } = await supabase
      .from('reminders')
      .select('id, title, due_date, household_id, lead_days')
      .eq('is_checked', false)
      .lte('due_date', tomorrow + 'T23:59:59Z')
      .or('snoozed_until.is.null,snoozed_until.lte.' + new Date().toISOString())

    // 2. Find tasks due today that are not completed
    const { data: dueTasks } = await supabase
      .from('tasks')
      .select('id, title, due_date, household_id, assigned_to')
      .eq('is_completed', false)
      .lte('due_date', today + 'T23:59:59Z')

    // 3. Find groceries expiring within 3 days
    const { data: expiringGroceries } = await supabase
      .from('groceries')
      .select('id, name, expiration_date, household_id')
      .not('expiration_date', 'is', null)
      .lte('expiration_date', threeDaysOut)
      .gte('expiration_date', today)

    // Collect household IDs that need notifications
    const householdNotifications: Record<string, { title: string; body: string }[]> = {}

    const addNotification = (householdId: string, title: string, body: string) => {
      if (!householdNotifications[householdId]) householdNotifications[householdId] = []
      householdNotifications[householdId].push({ title, body })
    }

    // Process reminders
    for (const r of dueReminders || []) {
      addNotification(r.household_id, '⏰ Reminder Due', r.title)
    }

    // Process tasks
    for (const t of dueTasks || []) {
      const assignee = t.assigned_to ? ` (${t.assigned_to})` : ''
      addNotification(t.household_id, '✅ Task Due Today', `${t.title}${assignee}`)
    }

    // Process expiring groceries
    for (const g of expiringGroceries || []) {
      addNotification(g.household_id, '🥫 Expiring Soon', `${g.name} expires on ${g.expiration_date}`)
    }

    // For each household, get members with notification preferences enabled, then call send-push
    let totalSent = 0
    const functionUrl = Deno.env.get('SUPABASE_URL') + '/functions/v1/send-push'

    for (const [householdId, notifications] of Object.entries(householdNotifications)) {
      // Get household members
      const { data: members } = await supabase
        .from('household_members')
        .select('user_id')
        .eq('household_id', householdId)

      if (!members || members.length === 0) continue

      const userIds = members.map(m => m.user_id)

      // Get notification preferences for these users
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('user_id, reminders_enabled, tasks_enabled, groceries_enabled')
        .in('user_id', userIds)

      const prefsMap = new Map(
        (prefs || []).map(p => [p.user_id, p])
      )

      // Send each notification to appropriate users
      for (const notif of notifications) {
        let eligibleUsers = userIds

        // Filter by preference category
        if (notif.title.includes('Reminder')) {
          eligibleUsers = eligibleUsers.filter(uid => {
            const p = prefsMap.get(uid)
            return !p || p.reminders_enabled !== false
          })
        } else if (notif.title.includes('Task')) {
          eligibleUsers = eligibleUsers.filter(uid => {
            const p = prefsMap.get(uid)
            return !p || p.tasks_enabled !== false
          })
        } else if (notif.title.includes('Expiring')) {
          eligibleUsers = eligibleUsers.filter(uid => {
            const p = prefsMap.get(uid)
            return !p || p.groceries_enabled !== false
          })
        }

        if (eligibleUsers.length === 0) continue

        try {
          await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              user_ids: eligibleUsers,
              title: notif.title,
              body: notif.body,
            }),
          })
          totalSent++
        } catch (e) {
          console.error('Failed to send notification:', e)
        }
      }
    }

    return new Response(
      JSON.stringify({
        processed: {
          reminders: dueReminders?.length || 0,
          tasks: dueTasks?.length || 0,
          groceries: expiringGroceries?.length || 0,
        },
        notificationsSent: totalSent,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
