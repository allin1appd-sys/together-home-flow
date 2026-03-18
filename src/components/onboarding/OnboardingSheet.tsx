import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { CheckSquare, ShoppingCart, Bell, UtensilsCrossed, Wrench, StickyNote, DollarSign, Plane } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function OnboardingSheet() {
  const { t } = useTranslation();
  const { householdId } = useAuth();
  const { createHousehold } = useHousehold();
  const [open, setOpen] = useState(!householdId);
  const [loading, setLoading] = useState(false);

  const features = [
    { icon: CheckSquare, label: t('nav.tasks'), desc: t('onboarding.features.tasks') },
    { icon: ShoppingCart, label: t('nav.groceries'), desc: t('onboarding.features.groceries') },
    { icon: UtensilsCrossed, label: t('nav.meals'), desc: t('onboarding.features.meals') },
    { icon: Bell, label: t('nav.reminders'), desc: t('onboarding.features.reminders') },
    { icon: DollarSign, label: t('nav.budget'), desc: t('onboarding.features.budget') },
    { icon: Wrench, label: t('nav.maintenance'), desc: t('onboarding.features.maintenance') },
    { icon: StickyNote, label: t('nav.notes'), desc: t('onboarding.features.notes') },
    { icon: Plane, label: t('nav.trips'), desc: t('onboarding.features.trips') },
  ];

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (!householdId) await createHousehold();
      setOpen(false);
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
          <motion.div key="onboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{t('onboarding.welcomeTitle')}</h2>
              <p className="text-sm text-muted-foreground mt-2">{t('onboarding.welcomeDescription')}</p>
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
              {loading ? t('onboarding.settingUp') : t('auth.getStarted')}
            </Button>
          </motion.div>
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}