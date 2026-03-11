import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Bell, Wrench, StickyNote, Wallet, Settings } from 'lucide-react';

const items = [
  { path: '/shopping', label: 'Shopping List', icon: ShoppingBag },
  { path: '/reminders', label: 'Reminders', icon: Bell },
  { path: '/maintenance', label: 'Maintenance', icon: Wrench },
  { path: '/notes', label: 'Notes', icon: StickyNote },
  { path: '/budget', label: 'Budget', icon: Wallet },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function MoreDrawer({ open, onOpenChange }: Props) {
  const navigate = useNavigate();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-lg">More</SheetTitle>
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
