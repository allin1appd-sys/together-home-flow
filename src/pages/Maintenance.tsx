import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMaintenanceTasks } from '@/hooks/data/useMaintenanceTasks';
import { useFamilyMembers } from '@/hooks/data/useFamilyMembers';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Check, Trash2, Wrench } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MaintenanceTask } from '@/types';
import { differenceInDays, parseISO, format } from 'date-fns';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import PullToRefresh from '@/components/shared/PullToRefresh';
import EmptyState from '@/components/shared/EmptyState';
import { maintenanceSchema } from '@/lib/validations';
import { toast } from 'sonner';

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };
type TaskStatus = 'overdue' | 'due-soon' | 'on-track';
function getStatus(nextDue: string): TaskStatus { const diff = differenceInDays(parseISO(nextDue), new Date()); if (diff < 0) return 'overdue'; if (diff <= 7) return 'due-soon'; return 'on-track'; }

function MaintenanceCard({ task, onComplete, onDelete, onEdit, t }: { task: MaintenanceTask; onComplete: (id: string) => void; onDelete: (id: string) => void; onEdit: (task: MaintenanceTask) => void; t: (key: string, opts?: any) => string }) {
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-120, -60, 0], [1, 0.6, 0]);
  const checkScale = useTransform(x, [-120, -60, 0], [1.2, 0.8, 0]);
  const handleDragEnd = () => { if (x.get() < -100) onComplete(task.id); };
  const status = getStatus(task.nextDue);
  const statusConfig: Record<TaskStatus, { label: string; className: string }> = { overdue: { label: t('maintenance.overdue'), className: 'bg-destructive text-destructive-foreground' }, 'due-soon': { label: t('maintenance.dueSoon'), className: 'bg-warning text-warning-foreground' }, 'on-track': { label: t('maintenance.onTrack'), className: 'bg-primary/15 text-primary' } };
  const { label, className } = statusConfig[status];
  const daysUntil = differenceInDays(parseISO(task.nextDue), new Date());
  return (
    <div className="relative overflow-hidden rounded-lg">
      <motion.div className="absolute inset-0 bg-green-500 flex items-center justify-end pe-6 rounded-lg" style={{ opacity: bgOpacity }}><motion.div style={{ scale: checkScale }}><Check className="h-6 w-6 text-white" /></motion.div></motion.div>
      <motion.div drag="x" dragConstraints={{ left: -150, right: 0 }} dragElastic={0.1} onDragEnd={handleDragEnd} style={{ x }} className="relative z-10">
        <Card className="cursor-pointer" onClick={() => onEdit(task)}>
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Wrench className="h-4 w-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="text-sm font-medium truncate">{task.title}</span><Badge className={cn('text-[10px] px-1.5 py-0 shrink-0', className)}>{label}</Badge></div>
                <p className="text-xs text-muted-foreground mt-0.5">{t('maintenance.everyDays', { count: task.frequencyDays })}{task.assignedTo && ` · ${task.assignedTo}`}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{daysUntil < 0 ? t('maintenance.daysOverdue', { count: Math.abs(daysUntil) }) : daysUntil === 0 ? t('maintenance.dueToday') : t('maintenance.dueInDays', { count: daysUntil })}{task.lastCompleted && ` · ${t('maintenance.lastDone', { date: task.lastCompleted })}`}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="p-1 text-muted-foreground active:text-destructive shrink-0"><Trash2 className="h-4 w-4" /></button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

const Maintenance = () => {
  const { t } = useTranslation();
  const { householdId } = useAuth();
  const { maintenanceTasks, isLoading, addMaintenanceTask, updateMaintenanceTask, deleteMaintenanceTask, completeMaintenanceTask } = useMaintenanceTasks();
  const { familyMembers } = useFamilyMembers();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceTask | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [frequencyDays, setFrequencyDays] = useState('30');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');

  const sorted = [...maintenanceTasks].sort((a, b) => differenceInDays(parseISO(a.nextDue), new Date()) - differenceInDays(parseISO(b.nextDue), new Date()));

  const openNew = () => { setEditing(null); setTitle(''); setFrequencyDays('30'); setAssignedTo(''); setNotes(''); setSheetOpen(true); };
  const openEdit = (task: MaintenanceTask) => { setEditing(task); setTitle(task.title); setFrequencyDays(String(task.frequencyDays)); setAssignedTo(task.assignedTo || ''); setNotes(task.notes || ''); setSheetOpen(true); };

  const handleSave = () => {
    const parsed = maintenanceSchema.safeParse({
      title, frequencyDays: parseInt(frequencyDays) || 0,
      assignedTo: assignedTo.trim() || undefined, notes: notes.trim() || undefined,
    });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }

    const freq = parseInt(frequencyDays) || 30;
    if (editing) { updateMaintenanceTask({ ...editing, title: title.trim(), frequencyDays: freq, assignedTo: assignedTo.trim() || undefined, notes: notes.trim() || undefined }); }
    else { addMaintenanceTask({ id: `mt-${Date.now()}`, title: title.trim(), frequencyDays: freq, nextDue: format(new Date(), 'yyyy-MM-dd'), assignedTo: assignedTo.trim() || undefined, notes: notes.trim() || undefined, createdAt: format(new Date(), 'yyyy-MM-dd') }); }
    setSheetOpen(false);
  };

  if (isLoading) return <div className="px-4 pt-6 space-y-4 pb-24"><Skeleton className="h-8 w-36" /><div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div></div>;

  return (
    <PullToRefresh queryKeys={[['maintenance_tasks', householdId!]]}>
      <div className="px-4 pt-6 space-y-4 pb-24">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">{t('maintenance.maintenance')}</h1><Button size="sm" onClick={openNew} className="gap-1"><Plus className="h-4 w-4" /> {t('common.add')}</Button></div>
        <AnimatePresence>
          {sorted.length === 0 ? <EmptyState icon={Wrench} title={t('maintenance.noTasks')} description={t('maintenance.keepHome')} actionLabel={t('maintenance.addTask')} onAction={openNew} /> : (
            <div className="space-y-2">{sorted.map(task => <motion.div key={task.id} layout initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0, height: 0 }} transition={spring}><MaintenanceCard task={task} onComplete={completeMaintenanceTask} onDelete={(id) => setDeleteId(id)} onEdit={openEdit} t={t} /></motion.div>)}</div>
          )}
        </AnimatePresence>
        {sorted.length > 0 && <p className="text-xs text-muted-foreground text-center pt-2">{t('common.swipeLeftDone')}</p>}

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8">
            <SheetHeader><SheetTitle>{editing ? t('maintenance.editTask') : t('maintenance.newTask')}</SheetTitle></SheetHeader>
            <div className="space-y-4 pt-4">
              <div><Label>{t('maintenance.taskName')}</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Replace HVAC filter" /></div>
              <div><Label>{t('maintenance.frequencyDays')}</Label><Input type="number" value={frequencyDays} onChange={(e) => setFrequencyDays(e.target.value)} placeholder="30" /></div>
              <div><Label>{t('maintenance.assignedToOptional')}</Label>
                <Select value={assignedTo || '_none'} onValueChange={(v) => setAssignedTo(v === '_none' ? '' : v)}><SelectTrigger><SelectValue placeholder={t('tasks.assignTo')} /></SelectTrigger><SelectContent><SelectItem value="_none">{t('common.unassigned')}</SelectItem>{familyMembers.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div><Label>{t('maintenance.notesOptional')}</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('maintenance.anyDetails')} rows={2} /></div>
              <Button className="w-full" onClick={handleSave}>{editing ? t('trips.update') : t('maintenance.addTask')}</Button>
            </div>
          </SheetContent>
        </Sheet>

        <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title={t('maintenance.deleteTask')} description={t('maintenance.deleteTaskDesc')} onConfirm={() => { if (deleteId) deleteMaintenanceTask(deleteId); setDeleteId(null); }} />
      </div>
    </PullToRefresh>
  );
};

export default Maintenance;