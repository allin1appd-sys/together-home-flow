import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyMembers } from '@/hooks/data/useFamilyMembers';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, Monitor, Plus, X, LogOut, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

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
  const { familyMembers, addFamilyMember, removeFamilyMember } = useFamilyMembers();
  const { preferences, updatePreference } = useNotificationPreferences();
  const [newMemberName, setNewMemberName] = useState('');
  const navigate = useNavigate();

  const displayName = user?.user_metadata?.display_name || user?.email || '';

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const usedColors = familyMembers.map(m => m.color);
    const nextColor = MEMBER_COLORS.find(c => !usedColors.includes(c)) || MEMBER_COLORS[familyMembers.length % MEMBER_COLORS.length];
    addFamilyMember({ id: `fm-${Date.now()}`, name: newMemberName.trim(), color: nextColor });
    setNewMemberName('');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="px-4 pt-6 space-y-5 pb-24">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Email</Label>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Display Name</Label>
            <p className="text-sm text-muted-foreground">{displayName}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Family Members</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-3">
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
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </CardTitle>
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
    </div>
  );
};

export default Settings;
