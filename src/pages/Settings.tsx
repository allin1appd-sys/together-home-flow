import { useTheme } from 'next-themes';
import { useHomeStore } from '@/stores/useHomeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { userName, setUserName } = useHomeStore();

  return (
    <div className="px-4 pt-6 space-y-5">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm">Your Name</Label>
            <Input
              id="name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl p-4 text-sm transition-colors',
                  theme === t.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                <t.icon className="h-5 w-5" />
                <span className="font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
