import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { supabase } from '@/integrations/supabase/client';
import { CheckSquare, ShoppingCart, Bell, UtensilsCrossed, Wrench, StickyNote, DollarSign, Plane } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const features = [
  { icon: CheckSquare, label: 'Tasks', desc: 'Track household chores with priorities & assignments' },
  { icon: ShoppingCart, label: 'Groceries', desc: 'Manage inventory & shopping lists' },
  { icon: UtensilsCrossed, label: 'Meals', desc: 'Plan weekly meals with recipes' },
  { icon: Bell, label: 'Reminders', desc: 'Never miss a bill or appointment' },
  { icon: DollarSign, label: 'Budget', desc: 'Track income & expenses' },
  { icon: Wrench, label: 'Maintenance', desc: 'Schedule recurring home tasks' },
  { icon: StickyNote, label: 'Notes', desc: 'Shared family note board' },
  { icon: Plane, label: 'Trips', desc: 'Plan itineraries & packing lists' },
];

export default function OnboardingSheet() {
  const { householdId } = useAuth();
  const { createHousehold, updateProfile } = useHousehold();
  const [open, setOpen] = useState(!householdId);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (name.trim()) await updateProfile(name.trim());
      if (!householdId) await createHousehold();
      setOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setLoading(true);
    try {
      if (name.trim()) await updateProfile(name.trim());
      const { error } = await supabase.rpc('join_household_by_code', { _code: inviteCode.trim().toUpperCase() });
      if (error) throw error;
      setOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  if (householdId) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) handleFinish(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto pb-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6 pt-6 text-center">
              <div>
                <h2 className="text-2xl font-bold">Welcome to HomeHub 👋</h2>
                <p className="text-sm text-muted-foreground mt-2">Your all-in-one household management app</p>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">What's your name?</p>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="text-center text-lg h-12" autoFocus />
              </div>
              <Button className="w-full" size="lg" onClick={() => setStep(1)}>Continue</Button>
            </motion.div>
          )}
          {step === 1 && !mode && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5 pt-6">
              <div className="text-center">
                <h2 className="text-xl font-bold">How would you like to start?</h2>
                <p className="text-sm text-muted-foreground mt-1">Create a new household or join an existing one</p>
              </div>
              <div className="space-y-3">
                <Button className="w-full h-14 text-base" size="lg" onClick={() => setMode('create')}>
                  🏠 Create New Household
                </Button>
                <Button variant="outline" className="w-full h-14 text-base" size="lg" onClick={() => setMode('join')}>
                  🔗 Join with Invite Code
                </Button>
              </div>
              <button onClick={() => setStep(0)} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">← Back</button>
            </motion.div>
          )}
          {step === 1 && mode === 'create' && (
            <motion.div key="step-create" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5 pt-6">
              <div className="text-center">
                <h2 className="text-xl font-bold">Here's what you can do</h2>
                <p className="text-sm text-muted-foreground mt-1">Everything your household needs in one place</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {features.map(f => (
                  <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                    <f.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div><p className="text-sm font-medium">{f.label}</p><p className="text-[11px] text-muted-foreground leading-tight">{f.desc}</p></div>
                  </div>
                ))}
              </div>
              <Button className="w-full" size="lg" onClick={handleFinish} disabled={loading}>
                {loading ? 'Setting up...' : 'Get Started 🚀'}
              </Button>
              <button onClick={() => setMode(null)} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">← Back</button>
            </motion.div>
          )}
          {step === 1 && mode === 'join' && (
            <motion.div key="step-join" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5 pt-6 text-center">
              <div>
                <h2 className="text-xl font-bold">Join a Household</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter the 6-character code shared by a family member</p>
              </div>
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                className="text-center text-2xl h-14 font-mono tracking-[0.3em]"
                maxLength={6}
                autoFocus
              />
              <Button className="w-full" size="lg" onClick={handleJoin} disabled={loading || inviteCode.length < 6}>
                {loading ? 'Joining...' : 'Join Household'}
              </Button>
              <button onClick={() => setMode(null)} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">← Back</button>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
