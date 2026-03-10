import { Home, CheckSquare, ShoppingCart, UtensilsCrossed, Plane, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { MoreDrawer } from './MoreDrawer';

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/groceries', label: 'Groceries', icon: ShoppingCart },
  { path: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { path: '/trips', label: 'Trips', icon: Plane },
];

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md safe-bottom">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors rounded-lg',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <tab.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg"
          >
            <Menu className="h-5 w-5" />
            <span className="font-medium">More</span>
          </button>
        </div>
      </nav>
      <MoreDrawer open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
