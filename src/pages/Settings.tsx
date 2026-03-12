import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useFamilyMembers } from '@/hooks/data/useFamilyMembers';
import { useHouseholdMembers } from '@/hooks/data/useHouseholdMembers';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useHouseholdInvites } from '@/hooks/data/useHouseholdInvites';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, Monitor, Plus, X, LogOut, Bell, Copy, Share2, Check, Pencil, Home, Users, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

const MEMBER_COLORS = [
  'hsl(220, 70%, 55%)', 'hsl(340, 70%, 55%)', 'hsl(150, 60%, 45%)', 'hsl(30, 80%, 55%)',
  'hsl(280, 60%, 55%)', 'hsl(190, 70%, 45%)', 'hsl(45, 80%, 50%)', 'hsl(0, 65%, 55%)',
];

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { updateProfile } = useHousehold();
  const { familyMembers, addFamilyMember, removeFamilyMember } = useFamilyMembers();
  const { members, household, isOwner, removeMember, updateHouseholdName } = useHouseholdMembers();
  const { preferences, updatePreference } = useNotificationPreferences();
  const { invites, createInvite, deleteInvite, isCreating } = useHouseholdInvites();
  const [newMemberName, setNewMemberName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [savingName, setSavingName] = useState(false);
  const [editingHouseholdName, setEditingHouseholdName] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const usedColors = familyMembers.map(m => m.color);
    const nextColor = MEMBER_COLORS.find(c => !usedColors.includes(c)) || MEMBER_COLORS[familyMembers.length % MEMBER_COLORS.length];
    addFamilyMember({ id: `fm-${Date.now()}`, name: newMemberName.trim(), color: nextColor });
    setNewMemberName('');
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Code copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    try {
      await updateProfile(displayName.trim());
      toast.success('Name updated');
      setEditingName(false);
    } catch {
      toast.error('Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveHouseholdName = () => {
    if (!householdName.trim()) return;
    updateHouseholdName(householdName.trim());
    toast.success('Household name updated');
    setEditingHouseholdName(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/phone-signup');
  };

  return (
    <div className="px-4 pt-6 space-y-5 pb-24">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Phone</Label>
            <p className="text-sm text-muted-foreground">{user?.user_metadata?.phone || 'Family member'}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Display Name</Label>
            {editingName ? (
              <div className="flex gap-2">
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="flex-1 h-9 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleSaveName()} autoFocus />
                <Button size="sm" onClick={handleSaveName} disabled={savingName} className="h-9 px-3"><Check className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingName(false)} className="h-9 px-3"><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground flex-1">{displayName || user?.email}</p>
                <button onClick={() => setEditingName(true)} className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Household Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Home className="h-4 w-4" /> Household</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Household Name</Label>
            {editingHouseholdName ? (
              <div className="flex gap-2">
                <Input value={householdName} onChange={(e) => setHouseholdName(e.target.value)} className="flex-1 h-9 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleSaveHouseholdName()} autoFocus />
                <Button size="sm" onClick={handleSaveHouseholdName} className="h-9 px-3"><Check className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingHouseholdName(false)} className="h-9 px-3"><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground flex-1">{household?.name || 'My Home'}</p>
                {isOwner && (
                  <button onClick={() => { setHouseholdName(household?.name || ''); setEditingHouseholdName(true); }} className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Members ({members.length})</Label>
            <div className="space-y-2">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: member.avatarColor }}>
                    {member.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.displayName}{member.userId === user?.id ? ' (you)' : ''}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{member.role}</p>
                  </div>
                  {isOwner && member.userId !== user?.id && (
                    <button onClick={() => setRemoveMemberId(member.id)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" /> Invite Family</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-muted-foreground">Generate a code to invite someone to your household. Codes expire in 7 days.</p>
          <Button size="sm" onClick={createInvite} disabled={isCreating} className="w-full">
            {isCreating ? 'Generating...' : 'Generate Invite Code'}
          </Button>
          {invites.map((inv: any) => (
            <div key={inv.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
              <code className="text-sm font-mono font-bold tracking-widest flex-1">{inv.code}</code>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">expires {format(new Date(inv.expires_at), 'MMM d')}</span>
              <button onClick={() => handleCopyCode(inv.code, inv.id)} className="p-1 text-muted-foreground hover:text-foreground">
                {copiedId === inv.id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => deleteInvite(inv.id)} className="p-1 text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Family Members</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-muted-foreground">Labels for task and maintenance assignment (not login accounts)</p>
          {familyMembers.map(member => (
            <div key={member.id} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: member.color }}>{member.name.charAt(0).toUpperCase()}</div>
              <span className="text-sm font-medium flex-1">{member.name}</span>
              <button onClick={() => removeFamilyMember(member.id)} className="p-1 text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="Add family member" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddMember()} className="flex-1 h-9 text-sm" />
            <Button size="sm" variant="outline" onClick={handleAddMember} className="h-9 px-3"><Plus className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Reminders</Label>
            <Switch checked={preferences.remindersEnabled} onCheckedChange={(v) => updatePreference({ remindersEnabled: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Tasks</Label>
            <Switch checked={preferences.tasksEnabled} onCheckedChange={(v) => updatePreference({ tasksEnabled: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Groceries</Label>
            <Switch checked={preferences.groceriesEnabled} onCheckedChange={(v) => updatePreference({ groceriesEnabled: v })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-2">
            {themes.map(t => (
              <button key={t.value} onClick={() => setTheme(t.value)} className={cn('flex flex-col items-center gap-2 rounded-xl p-4 text-sm transition-colors', theme === t.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent')}>
                <t.icon className="h-5 w-5" /><span className="font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full gap-2" onClick={handleSignOut}>
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>

      <ConfirmDialog
        open={!!removeMemberId}
        onOpenChange={(open) => !open && setRemoveMemberId(null)}
        title="Remove member?"
        description="This person will lose access to the household."
        onConfirm={() => { if (removeMemberId) removeMember(removeMemberId); setRemoveMemberId(null); }}
      />
    </div>
  );
};

export default Settings;
