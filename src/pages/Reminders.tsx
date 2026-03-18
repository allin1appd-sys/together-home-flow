import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReminders } from '@/hooks/data/useReminders';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Clock, Plus, Trash2, Check, RotateCcw, AlarmClock } from 'lucide-react';
import DatePicker from '@/components/shared/DatePicker';
import { format, parseISO, differenceInDays, addHours, addDays } from 'date-fns';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Reminder, ReminderCategory, ReminderRepeat } from '@/types';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import PullToRefresh from '@/components/shared/PullToRefresh';
import EmptyState from '@/components/shared/EmptyState';
import { reminderSchema } from '@/lib/validations';
import { toast } from 'sonner';

const CATEGORIES: ReminderCategory[] = ['Bills & Payments', 'Health & Medical', 'Home Maintenance', 'Subscriptions', 'Documents & Renewals', 'Custom'];
const categoryIcon: Record<ReminderCategory, string> = { 'Bills & Payments': '💳', 'Health & Medical': '🏥', 'Home Maintenance': '🔧', 'Subscriptions': '📺', 'Documents & Renewals': '📄', 'Custom': '📌' };

const SwipeableReminderCard = ({ reminder, onTap, onDelete, onToggle, onSnooze, t }: { reminder: Reminder; onTap: () => void; onDelete: () => void; onToggle: () => void; onSnooze: (until: string) => void; t: (key: string, opts?: any) => string }) => {
  const x = useMotionValue(0);
  const trashOpacity = useTransform(x, [-100, -50], [1, 0]);
  const daysUntil = differenceInDays(parseISO(reminder.dueDate), new Date());
  const isOverdue = daysUntil < 0 && !reminder.isChecked;
  const isDueToday = daysUntil === 0 && !reminder.isChecked;

  return (
    <div className="relative overflow-hidden rounded-xl">
      <motion.div className="absolute inset-0 bg-destructive flex items-center justify-end pe-6 rounded-xl" style={{ opacity: trashOpacity }}><Trash2 className="h-5 w-5 text-destructive-foreground" /></motion.div>
      <motion.div style={{ x }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.3}
        onDragEnd={(_, info) => { if (info.offset.x < -100) { animate(x, -400, { duration: 0.2 }); setTimeout(onDelete, 200); } else { animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 }); } }}
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
        <Card className={`overflow-hidden cursor-pointer active:scale-[0.98] transition-transform ${reminder.isChecked ? 'opacity-50' : ''}`} onClick={onTap}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${reminder.isChecked ? 'bg-primary border-primary' : isOverdue ? 'border-destructive' : 'border-muted-foreground/40'}`}>
                {reminder.isChecked && <Check className="h-3 w-3 text-primary-foreground" />}
              </button>
              <div className="min-w-0 flex-1">
                <h3 className={`font-semibold text-sm ${reminder.isChecked ? 'line-through text-muted-foreground' : ''}`}>{reminder.title}</h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs">{categoryIcon[reminder.category]}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{reminder.category}</Badge>
                  {reminder.repeat !== 'none' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5"><RotateCcw className="h-2.5 w-2.5" />{reminder.repeat}</Badge>}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{format(parseISO(reminder.dueDate), 'MMM d, yyyy')}</span>
                  {isOverdue && <span className="text-destructive font-medium">• {t('reminders.overdue')}</span>}
                  {isDueToday && <span className="text-warning font-medium">• {t('reminders.dueToday')}</span>}
                  {!isOverdue && !isDueToday && !reminder.isChecked && <span>• {t('reminders.daysLeft', { count: daysUntil })}</span>}
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild><button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"><AlarmClock className="h-4 w-4 text-muted-foreground" /></button></PopoverTrigger>
                <PopoverContent className="w-40 p-1" align="end">
                  <button className="w-full text-start text-sm px-3 py-2 rounded-md hover:bg-muted" onClick={() => onSnooze(addHours(new Date(), 1).toISOString())}>{t('reminders.snooze1h')}</button>
                  <button className="w-full text-start text-sm px-3 py-2 rounded-md hover:bg-muted" onClick={() => onSnooze(addDays(new Date(), 1).toISOString())}>{t('reminders.snooze1d')}</button>
                  <button className="w-full text-start text-sm px-3 py-2 rounded-md hover:bg-muted" onClick={() => onSnooze(addDays(new Date(), 3).toISOString())}>{t('reminders.snooze3d')}</button>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const emptyReminder = (): Omit<Reminder, 'id'> => ({ title: '', description: '', dueDate: format(new Date(), 'yyyy-MM-dd'), isChecked: false, category: 'Custom', leadDays: 3, repeat: 'none', createdAt: new Date().toISOString() });

const Reminders = () => {
  const { t } = useTranslation();
  const { householdId } = useAuth();
  const { reminders, isLoading, addReminder, updateReminder, deleteReminder, toggleReminder, snoozeReminder } = useReminders();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [form, setForm] = useState<Omit<Reminder, 'id'>>(emptyReminder());
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const REPEATS: { value: ReminderRepeat; label: string }[] = [
    { value: 'none', label: t('reminders.oneTime') }, { value: 'daily', label: t('reminders.daily') }, { value: 'weekly', label: t('reminders.weekly') }, { value: 'monthly', label: t('reminders.monthly') }, { value: 'yearly', label: t('reminders.yearly') },
  ];

  const filtered = reminders.filter((r) => { if (filter === 'active') return !r.isChecked; if (filter === 'done') return r.isChecked; return true; });

  const openAdd = () => { setEditingReminder(null); setForm(emptyReminder()); setSheetOpen(true); };
  const openEdit = (r: Reminder) => { setEditingReminder(r); setForm({ title: r.title, description: r.description || '', dueDate: r.dueDate, isChecked: r.isChecked, category: r.category, leadDays: r.leadDays, repeat: r.repeat, createdAt: r.createdAt }); setSheetOpen(true); };

  const handleSave = () => {
    const parsed = reminderSchema.safeParse({
      title: form.title, description: form.description || undefined,
      dueDate: form.dueDate, category: form.category, leadDays: form.leadDays, repeat: form.repeat,
    });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }

    if (editingReminder) { updateReminder({ ...editingReminder, ...form }); }
    else { addReminder({ id: `rem-${Date.now()}`, ...form }); }
    setSheetOpen(false);
  };

  if (isLoading) return <div className="px-4 pt-6 space-y-4 pb-24"><Skeleton className="h-8 w-32" /><div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div></div>;

  const filterLabels = { all: t('common.all'), active: t('common.active'), done: t('common.done') };

  return (
    <PullToRefresh queryKeys={[['reminders', householdId!]]}>
      <div className="px-4 pt-6 pb-24 space-y-4">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">{t('reminders.reminders')}</h1></div>
        <div className="flex gap-2">
          {(['all', 'active', 'done'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              {filterLabels[f]} {f === 'all' ? `(${reminders.length})` : f === 'active' ? `(${reminders.filter(r => !r.isChecked).length})` : `(${reminders.filter(r => r.isChecked).length})`}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={Bell} title={t('reminders.noReminders')} description={t('reminders.neverForget')} actionLabel={t('reminders.addReminder')} onAction={openAdd} />
        ) : (
          <div className="space-y-3">
            {filtered.sort((a, b) => { if (a.isChecked !== b.isChecked) return a.isChecked ? 1 : -1; return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); }).map((reminder) => (
              <SwipeableReminderCard key={reminder.id} reminder={reminder} onTap={() => openEdit(reminder)} onDelete={() => setDeleteId(reminder.id)} onToggle={() => toggleReminder(reminder.id)} onSnooze={(until) => snoozeReminder(reminder.id, until)} t={t} />
            ))}
          </div>
        )}
        <motion.button className="fixed bottom-24 end-5 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center" whileTap={{ scale: 0.9 }} onClick={openAdd}><Plus className="h-6 w-6" /></motion.button>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <SheetHeader><SheetTitle>{editingReminder ? t('reminders.editReminder') : t('reminders.newReminder')}</SheetTitle><SheetDescription>{editingReminder ? t('reminders.updateDetails') : t('reminders.neverForgetAgain')}</SheetDescription></SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-1.5"><Label>{t('common.title')}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Pay electricity bill" /></div>
              <div className="space-y-1.5"><Label>{t('common.description')} ({t('common.optional')})</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>{t('reminders.dueDate')}</Label><DatePicker value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} /></div>
                <div className="space-y-1.5"><Label>{t('reminders.leadTime')}</Label><Input type="number" min={0} max={30} value={form.leadDays} onChange={(e) => setForm({ ...form, leadDays: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>{t('common.category')}</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ReminderCategory })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{categoryIcon[c]} {c}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1.5"><Label>{t('reminders.repeat')}</Label>
                  <Select value={form.repeat} onValueChange={(v) => setForm({ ...form, repeat: v as ReminderRepeat })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REPEATS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={handleSave} disabled={!form.title.trim()}>{editingReminder ? t('trips.update') : t('reminders.addReminder')}</Button>
                {editingReminder && <Button variant="destructive" size="icon" onClick={() => setDeleteId(editingReminder.id)}><Trash2 className="h-4 w-4" /></Button>}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title={t('reminders.deleteReminder')} description={t('reminders.deleteReminderDesc')} onConfirm={() => { if (deleteId) { deleteReminder(deleteId); setSheetOpen(false); } setDeleteId(null); }} />
      </div>
    </PullToRefresh>
  );
};

export default Reminders;