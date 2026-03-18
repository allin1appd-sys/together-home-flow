import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      <CommandInput placeholder={t('common.searchEverything')} />
      <CommandList>
        <CommandEmpty>{t('common.noResults')}</CommandEmpty>
        <CommandGroup heading={t('nav.tasks')}>{tasks.slice(0, 5).map(t2 => <CommandItem key={t2.id} onSelect={() => go('/tasks')} keywords={[t2.title]}><CheckSquare className="me-2 h-4 w-4 text-muted-foreground" /><span>{t2.title}</span></CommandItem>)}</CommandGroup>
        <CommandGroup heading={t('nav.groceries')}>{groceries.slice(0, 5).map(g => <CommandItem key={g.id} onSelect={() => go('/groceries')} keywords={[g.name]}><Apple className="me-2 h-4 w-4 text-muted-foreground" /><span>{g.name}</span></CommandItem>)}</CommandGroup>
        <CommandGroup heading={t('nav.trips')}>{trips.slice(0, 5).map(t2 => <CommandItem key={t2.id} onSelect={() => go('/trips')} keywords={[t2.title, t2.destination]}><Plane className="me-2 h-4 w-4 text-muted-foreground" /><span>{t2.title} — {t2.destination}</span></CommandItem>)}</CommandGroup>
        <CommandGroup heading={t('nav.reminders')}>{reminders.slice(0, 5).map(r => <CommandItem key={r.id} onSelect={() => go('/reminders')} keywords={[r.title]}><Bell className="me-2 h-4 w-4 text-muted-foreground" /><span>{r.title}</span></CommandItem>)}</CommandGroup>
        <CommandGroup heading={t('nav.maintenance')}>{maintenanceTasks.slice(0, 5).map(m => <CommandItem key={m.id} onSelect={() => go('/maintenance')} keywords={[m.title]}><Wrench className="me-2 h-4 w-4 text-muted-foreground" /><span>{m.title}</span></CommandItem>)}</CommandGroup>
        <CommandGroup heading={t('nav.notes')}>{notes.slice(0, 5).map(n => <CommandItem key={n.id} onSelect={() => go('/notes')} keywords={[n.title, n.body || '']}><StickyNote className="me-2 h-4 w-4 text-muted-foreground" /><span>{n.title}</span></CommandItem>)}</CommandGroup>
        <CommandGroup heading={t('budget.transactions')}>{transactions.slice(0, 5).map(t2 => <CommandItem key={t2.id} onSelect={() => go('/budget')} keywords={[t2.description]}><DollarSign className="me-2 h-4 w-4 text-muted-foreground" /><span>{t2.description} — ${t2.amount.toFixed(2)}</span></CommandItem>)}</CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}