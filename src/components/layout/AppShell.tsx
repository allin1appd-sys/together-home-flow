import { ReactNode } from 'react';
import { BottomTabBar } from './BottomTabBar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 mx-auto max-w-lg">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
