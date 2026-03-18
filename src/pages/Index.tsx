import { format, differenceInDays, isToday, isTomorrow, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useTasks } from '@/hooks/data/useTasks';
import { useGroceries } from '@/hooks/data/useGroceries';
import { useReminders } from '@/hooks/data/useReminders';
import { useTrips } from '@/hooks/data/useTrips';
import { useMealPlans } from '@/hooks/data/useMealPlans';
import { useTransactions } from '@/hooks/data/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Plus, ShoppingCart, Bell, Plane, UtensilsCrossed, AlertTriangle, DollarSign, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import OnboardingSheet from '@/components/onboarding/OnboardingSheet';
import { Skeleton } from '@/components/ui/skeleton';

function SpeedDial({ navigate, t }: { navigate: (path: string) => void; t: (key: string) => string }) {
  const [open, setOpen] = useState(false);
  const speedDialItems = [
    { icon: Bell, label: t('dashboard.reminder'), path: '/reminders' },
    { icon: ShoppingCart, label: t('dashboard.grocery'), path: '/groceries' },
    { icon: CheckSquare, label: t('dashboard.task'), path: '/tasks' },
  ];
  return (
    <div className="fixed bottom-24 end-4 flex flex-col items-end gap-2 z-40">
      <AnimatePresence>
        {open && speedDialItems.map((item, i) => (
          <motion.button key={item.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: i * 0.05 } }} exit={{ opacity: 0, scale: 0.3, y: 10 }} whileTap={{ scale: 0.9 }}
            onClick={() => { navigate(item.path); setOpen(false); }} className="flex items-center gap-2">
            <span className="text-xs font-medium bg-card text-card-foreground px-2 py-1 rounded-lg shadow-sm">{item.label}</span>
            <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground shadow-md flex items-center justify-center"><item.icon className="h-4 w-4" /></div>
          </motion.button>
        ))}
      </AnimatePresence>
      <motion.button whileTap={{ scale: 0.9 }} animate={{ rotate: open ? 45 : 0 }} onClick={() => setOpen(!open)} className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"><Plus className="h-6 w-6" /></motion.button>
    </div>
  );
}

const settle = { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } } };

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { tasks, isLoading: tLoading } = useTasks();
  const { groceries } = useGroceries();
  const { reminders } = useReminders();
  const { trips } = useTrips();
  const { mealPlans } = useMealPlans();
  const { transactions } = useTransactions();
  const navigate = useNavigate();
  const now = new Date();

  const userName = user?.user_metadata?.display_name || 'there';
  const greeting = now.getHours() < 12 ? t('dashboard.goodMorning') : now.getHours() < 18 ? t('dashboard.goodAfternoon') : t('dashboard.goodEvening');

  const todayTasks = tasks.filter(t2 => t2.dueDate === format(now, 'yyyy-MM-dd') && !t2.isCompleted).sort((a, b) => {
    const p = { urgent: 0, high: 1, medium: 2, low: 3 };
    return p[a.priority] - p[b.priority];
  });

  const todayMeals = mealPlans.filter(m => m.date === format(now, 'yyyy-MM-dd'));
  const mealOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
  todayMeals.sort((a, b) => mealOrder[a.mealType] - mealOrder[b.mealType]);

  const upcomingReminders = reminders.filter(r => { if (r.isChecked) return false; const d = parseISO(r.dueDate); const diff = differenceInDays(d, now); return diff >= -1 && diff <= 2; });
  const expiringGroceries = groceries.filter(g => g.status === 'expiring' || g.status === 'expired');
  const nextTrip = trips.find(t2 => t2.status === 'upcoming');
  const tripCountdown = nextTrip ? differenceInDays(parseISO(nextTrip.startDate), now) : null;

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthlyTxns = transactions.filter(t2 => isWithinInterval(parseISO(t2.date), { start: monthStart, end: monthEnd }));
  const monthIncome = monthlyTxns.filter(t2 => t2.type === 'income').reduce((s, t2) => s + t2.amount, 0);
  const monthExpenses = monthlyTxns.filter(t2 => t2.type === 'expense').reduce((s, t2) => s + t2.amount, 0);
  const monthBalance = monthIncome - monthExpenses;

  const priorityColor: Record<string, string> = { urgent: 'bg-destructive text-destructive-foreground', high: 'bg-warning text-warning-foreground', medium: 'bg-primary text-primary-foreground', low: 'bg-muted text-muted-foreground' };

  if (tLoading) return <div className="px-4 pt-6 space-y-5"><Skeleton className="h-10 w-48" /><Skeleton className="h-20 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>;

  return (
    <div className="px-4 pt-6 space-y-5">
      <motion.div {...settle}><h1 className="text-2xl font-bold">{greeting}, {userName}</h1><p className="text-muted-foreground text-sm mt-0.5">{format(now, 'EEEE, MMMM d')}</p></motion.div>

      {expiringGroceries.length > 0 && <motion.div {...settle} transition={{ delay: 0.05 }}><button onClick={() => navigate('/groceries')} className="w-full"><Card className="border-warning/30 bg-warning/5"><CardContent className="flex items-center gap-3 p-4"><AlertTriangle className="h-5 w-5 text-warning shrink-0" /><div className="text-start"><p className="text-sm font-semibold">{t('dashboard.itemsExpiring', { count: expiringGroceries.length })}</p><p className="text-xs text-muted-foreground">{expiringGroceries.map(g => g.name).join(', ')}</p></div></CardContent></Card></button></motion.div>}

      {nextTrip && tripCountdown !== null && <motion.div {...settle} transition={{ delay: 0.1 }}><button onClick={() => navigate('/trips')} className="w-full"><Card className="border-primary/20 bg-accent/50"><CardContent className="flex items-center gap-3 p-4"><Plane className="h-5 w-5 text-primary shrink-0" /><div className="text-start"><p className="text-sm font-semibold">{nextTrip.title}</p><p className="text-xs text-muted-foreground">{nextTrip.destination} · {tripCountdown <= 0 ? t('dashboard.todayExcl') : t('dashboard.inDays', { count: tripCountdown })}</p></div></CardContent></Card></button></motion.div>}

      <motion.div {...settle} transition={{ delay: 0.15 }}><Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><UtensilsCrossed className="h-4 w-4 text-primary" />{t('dashboard.todaysMeals')}</CardTitle></CardHeader><CardContent className="pt-0">{todayMeals.length === 0 ? <p className="text-sm text-muted-foreground">{t('dashboard.noMealsPlanned')} <button onClick={() => navigate('/meals')} className="text-primary underline">{t('dashboard.planYourDay')}</button></p> : <div className="space-y-2">{todayMeals.map(m => <div key={m.id} className="flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground uppercase w-16">{m.mealType}</span><span className="text-sm flex-1">{m.customMealName}</span></div>)}</div>}</CardContent></Card></motion.div>

      <motion.div {...settle} transition={{ delay: 0.2 }}><Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CheckSquare className="h-4 w-4 text-primary" />{t('dashboard.tasksDueToday')}{todayTasks.length > 0 && <Badge variant="secondary" className="ms-auto text-xs">{todayTasks.length}</Badge>}</CardTitle></CardHeader><CardContent className="pt-0">{todayTasks.length === 0 ? <p className="text-sm text-muted-foreground">{t('dashboard.allClear')}</p> : <div className="space-y-2">{todayTasks.slice(0, 5).map(task => <div key={task.id} className="flex items-center gap-3"><Badge className={cn('text-[10px] px-1.5 py-0', priorityColor[task.priority])}>{task.priority}</Badge><span className="text-sm flex-1 truncate">{task.title}</span></div>)}{todayTasks.length > 5 && <button onClick={() => navigate('/tasks')} className="text-xs text-primary">{t('dashboard.more', { count: todayTasks.length - 5 })}</button>}</div>}</CardContent></Card></motion.div>

      {upcomingReminders.length > 0 && <motion.div {...settle} transition={{ delay: 0.25 }}><Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-primary" />{t('dashboard.upcomingReminders')}</CardTitle></CardHeader><CardContent className="pt-0 space-y-2">{upcomingReminders.map(r => <div key={r.id} className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-warning shrink-0" /><span className="text-sm flex-1">{r.title}</span><span className="text-xs text-muted-foreground">{isToday(parseISO(r.dueDate)) ? t('common.today') : isTomorrow(parseISO(r.dueDate)) ? t('common.tomorrow') : format(parseISO(r.dueDate), 'MMM d')}</span></div>)}</CardContent></Card></motion.div>}

      <motion.div {...settle} transition={{ delay: 0.3 }}><button onClick={() => navigate('/budget')} className="w-full"><Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />{t('dashboard.thisMonthsBudget')}</CardTitle></CardHeader><CardContent className="pt-0"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">{t('dashboard.spent')}</p><p className="text-lg font-bold flex items-center gap-1"><TrendingDown className="h-4 w-4 text-destructive" />${monthExpenses.toFixed(0)}</p></div><div className="text-end"><p className="text-xs text-muted-foreground">{t('dashboard.balance')}</p><p className={cn('text-lg font-bold', monthBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive')}>${monthBalance.toFixed(0)}</p></div></div></CardContent></Card></button></motion.div>

      <SpeedDial navigate={navigate} t={t} />
      <OnboardingSheet />
    </div>
  );
};

export default Dashboard;