import { ReactNode, useState } from 'react';
import { BottomTabBar } from './BottomTabBar';
import { GlobalSearch } from './GlobalSearch';
import { Search } from 'lucide-react';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';

export function AppShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  usePushNotifications();

  return (
    <div className="min-h-screen bg-background safe-top">
      <header className="sticky top-0 z-30 flex items-center justify-end px-4 py-2">
        <button
          onClick={() => setSearchOpen(true)}
          className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
      </header>
      <main className="pb-20 mx-auto max-w-lg">
        {children}
      </main>
      <BottomTabBar />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
