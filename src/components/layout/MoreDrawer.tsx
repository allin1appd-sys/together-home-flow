import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Bell, Wrench, StickyNote, Wallet, Settings } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function MoreDrawer({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const items = [
    { path: '/shopping', label: t('nav.shoppingList'), icon: ShoppingBag },
    { path: '/reminders', label: t('nav.reminders'), icon: Bell },
    { path: '/maintenance', label: t('nav.maintenance'), icon: Wrench },
    { path: '/notes', label: t('nav.notes'), icon: StickyNote },
    { path: '/budget', label: t('nav.budget'), icon: Wallet },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-lg">{t('nav.more')}</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-3 pt-2">
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                onOpenChange(false);
              }}
              className="flex flex-col items-center gap-2 rounded-xl bg-muted p-4 text-sm transition-colors hover:bg-accent"
            >
              <item.icon className="h-6 w-6 text-primary" />
              <span className="font-medium text-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}