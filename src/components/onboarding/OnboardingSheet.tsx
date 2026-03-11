import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
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
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (name.trim()) await updateProfile(name.trim());
      if (!householdId) await createHousehold();
      setOpen(false);
      // Force page reload to pick up new householdId
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
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
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5 pt-6">
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
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
