import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTasks } from '@/hooks/data/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, ClipboardList } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Task, Priority, TaskCategory } from '@/types';
import TaskCard from '@/components/tasks/TaskCard';
import TaskSheet from '@/components/tasks/TaskSheet';
import CompletionHistory from '@/components/tasks/CompletionHistory';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import PullToRefresh from '@/components/shared/PullToRefresh';
import EmptyState from '@/components/shared/EmptyState';

const categories: TaskCategory[] = ['cleaning', 'errands', 'repairs', 'kids', 'pets', 'cooking', 'shopping', 'other'];
const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

const Tasks = () => {
  const { t } = useTranslation();
  const { householdId } = useAuth();
  const { tasks, isLoading, addTask, toggleTask, deleteTask, updateTask, toggleSubTask } = useTasks();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const activeTasks = tasks.filter((t2) => !t2.isCompleted);
  const completedTasks = tasks.filter((t2) => t2.isCompleted);

  let filtered = activeTasks;
  if (filterPriority !== 'all') filtered = filtered.filter((t2) => t2.priority === filterPriority);
  if (filterCategory !== 'all') filtered = filtered.filter((t2) => t2.category === filterCategory);
  filtered.sort((a, b) => {
    const p = { urgent: 0, high: 1, medium: 2, low: 3 };
    return p[a.priority] - p[b.priority];
  });

  const handleEdit = (task: Task) => { setEditingTask(task); setSheetOpen(true); };
  const handleOpenNew = () => { setEditingTask(null); setSheetOpen(true); };

  if (isLoading) {
    return (
      <div className="px-4 pt-6 space-y-4 pb-24">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      </div>
    );
  }

  return (
    <PullToRefresh queryKeys={[['tasks', householdId!]]}>
      <div className="px-4 pt-6 space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('tasks.tasks')}</h1>
          <Button size="sm" onClick={handleOpenNew} className="gap-1"><Plus className="h-4 w-4" /> {t('common.add')}</Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">{t('common.active')} ({activeTasks.length})</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">{t('tasks.history')} ({completedTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-3">
            <div className="flex gap-2">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder={t('tasks.priority')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tasks.allPriorities')}</SelectItem>
                  {priorities.map((p) => <SelectItem key={p} value={p} className="capitalize">{t(`tasks.${p}`)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder={t('common.category')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tasks.allCategories')}</SelectItem>
                  {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{t(`tasks.${c}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <AnimatePresence>
              {filtered.length === 0 ? (
                <EmptyState icon={ClipboardList} title={t('tasks.noTasks')} description={t('tasks.noTasksDesc')} actionLabel={t('tasks.addTask')} onAction={handleOpenNew} />
              ) : (
                <div className="space-y-2">
                  {filtered.map((task) => (
                    <motion.div key={task.id} layout initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0, height: 0 }} transition={spring}>
                      <TaskCard task={task} onToggle={toggleTask} onDelete={(id) => setDeleteId(id)} onEdit={handleEdit} onToggleSubTask={toggleSubTask} />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
            {filtered.length > 0 && <p className="text-xs text-muted-foreground text-center pt-2">{t('common.swipeLeftComplete')}</p>}
          </TabsContent>

          <TabsContent value="history" className="mt-3">
            <CompletionHistory tasks={completedTasks} onToggle={toggleTask} />
          </TabsContent>
        </Tabs>

        <TaskSheet open={sheetOpen} onOpenChange={setSheetOpen} editingTask={editingTask} onAdd={addTask} onUpdate={updateTask} />

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title={t('tasks.deleteTask')}
          description={t('tasks.deleteTaskDesc')}
          onConfirm={() => { if (deleteId) deleteTask(deleteId); setDeleteId(null); }}
        />
      </div>
    </PullToRefresh>
  );
};

export default Tasks;