import { useState } from 'react';
import { useTasks } from '@/hooks/data/useTasks';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Task, Priority, TaskCategory } from '@/types';
import TaskCard from '@/components/tasks/TaskCard';
import TaskSheet from '@/components/tasks/TaskSheet';
import CompletionHistory from '@/components/tasks/CompletionHistory';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';

const categories: TaskCategory[] = ['cleaning', 'errands', 'repairs', 'kids', 'pets', 'cooking', 'shopping', 'other'];
const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

const Tasks = () => {
  const { tasks, isLoading, addTask, toggleTask, deleteTask, updateTask, toggleSubTask } = useTasks();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  let filtered = activeTasks;
  if (filterPriority !== 'all') filtered = filtered.filter((t) => t.priority === filterPriority);
  if (filterCategory !== 'all') filtered = filtered.filter((t) => t.category === filterCategory);
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
    <div className="px-4 pt-6 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button size="sm" onClick={handleOpenNew} className="gap-1"><Plus className="h-4 w-4" /> Add</Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="active" className="flex-1">Active ({activeTasks.length})</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3 mt-3">
          <div className="flex gap-2">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {priorities.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="text-center py-12"><p className="text-muted-foreground font-serif italic">No tasks here — enjoy the calm ☕</p></div>
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
          <p className="text-xs text-muted-foreground text-center pt-2">← Swipe left on a task to complete it</p>
        </TabsContent>

        <TabsContent value="history" className="mt-3">
          <CompletionHistory tasks={completedTasks} onToggle={toggleTask} />
        </TabsContent>
      </Tabs>

      <TaskSheet open={sheetOpen} onOpenChange={setSheetOpen} editingTask={editingTask} onAdd={addTask} onUpdate={updateTask} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete task?"
        description="This task will be permanently removed."
        onConfirm={() => { if (deleteId) deleteTask(deleteId); setDeleteId(null); }}
      />
    </div>
  );
};

export default Tasks;
