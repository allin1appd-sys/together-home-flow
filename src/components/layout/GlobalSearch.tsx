import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useTasks } from '@/hooks/data/useTasks';
import { useGroceries } from '@/hooks/data/useGroceries';
import { useTrips } from '@/hooks/data/useTrips';
import { useReminders } from '@/hooks/data/useReminders';
import { useMaintenanceTasks } from '@/hooks/data/useMaintenanceTasks';
import { useNotes } from '@/hooks/data/useNotes';
import { useTransactions } from '@/hooks/data/useTransactions';
import { CheckSquare, Apple, Plane, Bell, Wrench, StickyNote, DollarSign } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const { groceries } = useGroceries();
  const { trips } = useTrips();
  const { reminders } = useReminders();
  const { maintenanceTasks } = useMaintenanceTasks();
  const { notes } = useNotes();
  const { transactions } = useTransactions();

  const go = (path: string) => { navigate(path); onOpenChange(false); };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search everything..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Tasks">{tasks.slice(0, 5).map(t => <CommandItem key={t.id} onSelect={() => go('/tasks')} keywords={[t.title]}><CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" /><span>{t.title}</span></CommandItem>)}</CommandGroup>
        <CommandGroup heading="Groceries">{groceries.slice(0, 5).map(g => <CommandItem key={g.id} onSelect={() => go('/groceries')} keywords={[g.name]}><Apple className="mr-2 h-4 w-4 text-muted-foreground" /><span>{g.name}</span></CommandItem>)}</CommandGroup>
        <CommandGroup heading="Trips">{trips.slice(0, 5).map(t => <CommandItem key={t.id} onSelect={() => go('/trips')} keywords={[t.title, t.destination]}><Plane className="mr-2 h-4 w-4 text-muted-foreground" /><span>{t.title} — {t.destination}</span></CommandItem>)}</CommandGroup>
        <CommandGroup heading="Reminders">{reminders.slice(0, 5).map(r => <CommandItem key={r.id} onSelect={() => go('/reminders')} keywords={[r.title]}><Bell className="mr-2 h-4 w-4 text-muted-foreground" /><span>{r.title}</span></CommandItem>)}</CommandGroup>
        <CommandGroup heading="Maintenance">{maintenanceTasks.slice(0, 5).map(m => <CommandItem key={m.id} onSelect={() => go('/maintenance')} keywords={[m.title]}><Wrench className="mr-2 h-4 w-4 text-muted-foreground" /><span>{m.title}</span></CommandItem>)}</CommandGroup>
        <CommandGroup heading="Notes">{notes.slice(0, 5).map(n => <CommandItem key={n.id} onSelect={() => go('/notes')} keywords={[n.title, n.body || '']}><StickyNote className="mr-2 h-4 w-4 text-muted-foreground" /><span>{n.title}</span></CommandItem>)}</CommandGroup>
        <CommandGroup heading="Transactions">{transactions.slice(0, 5).map(t => <CommandItem key={t.id} onSelect={() => go('/budget')} keywords={[t.description]}><DollarSign className="mr-2 h-4 w-4 text-muted-foreground" /><span>{t.description} — ${t.amount.toFixed(2)}</span></CommandItem>)}</CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
