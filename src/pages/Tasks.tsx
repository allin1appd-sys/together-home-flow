import { useState } from 'react';
import { useHomeStore } from '@/stores/useHomeStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check, Trash2, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Task, Priority, TaskCategory } from '@/types';
import { format } from 'date-fns';

const priorityColor: Record<Priority, string> = {
  urgent: 'bg-destructive text-destructive-foreground',
  high: 'bg-warning text-warning-foreground',
  medium: 'bg-primary text-primary-foreground',
  low: 'bg-muted text-muted-foreground',
};

const categories: TaskCategory[] = ['cleaning', 'errands', 'repairs', 'kids', 'pets', 'cooking', 'shopping', 'other'];
const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

const Tasks = () => {
  const { tasks, addTask, toggleTask, deleteTask, toggleSubTask } = useHomeStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // New task form
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newCategory, setNewCategory] = useState<TaskCategory>('other');
  const [newDueDate, setNewDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  let filtered = activeTasks;
  if (filterPriority !== 'all') filtered = filtered.filter((t) => t.priority === filterPriority);
  if (filterCategory !== 'all') filtered = filtered.filter((t) => t.category === filterCategory);
  filtered.sort((a, b) => {
    const p = { urgent: 0, high: 1, medium: 2, low: 3 };
    return p[a.priority] - p[b.priority];
  });

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      priority: newPriority,
      category: newCategory,
      dueDate: newDueDate,
      isCompleted: false,
      isRecurring: false,
      subTasks: [],
      createdAt: new Date().toISOString(),
    };
    addTask(task);
    setNewTitle('');
    setNewPriority('medium');
    setNewCategory('other');
    setSheetOpen(false);
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button size="sm" onClick={() => setSheetOpen(true)} className="gap-1">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {priorities.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Active Tasks */}
      <AnimatePresence>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks here — enjoy the calm ☕</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-0.5 h-5 w-5 rounded-md border-2 border-primary flex items-center justify-center shrink-0 transition-colors hover:bg-primary/10"
                      >
                        {task.isCompleted && <Check className="h-3 w-3 text-primary" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{task.title}</span>
                          <Badge className={cn('text-[10px] px-1.5 py-0 shrink-0', priorityColor[task.priority])}>{task.priority}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground capitalize">{task.category}</span>
                          {task.dueDate && <span className="text-xs text-muted-foreground">· {task.dueDate === format(new Date(), 'yyyy-MM-dd') ? 'Today' : task.dueDate}</span>}
                        </div>
                        {/* Sub-tasks */}
                        {task.subTasks.length > 0 && expandedId === task.id && (
                          <div className="mt-2 space-y-1 pl-1">
                            {task.subTasks.map((st) => (
                              <button key={st.id} onClick={() => toggleSubTask(task.id, st.id)} className="flex items-center gap-2 w-full text-left">
                                <div className={cn('h-3.5 w-3.5 rounded border flex items-center justify-center', st.isCompleted ? 'bg-primary border-primary' : 'border-muted-foreground')}>
                                  {st.isCompleted && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                                </div>
                                <span className={cn('text-xs', st.isCompleted && 'line-through text-muted-foreground')}>{st.title}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {task.subTasks.length > 0 && (
                          <button onClick={() => setExpandedId(expandedId === task.id ? null : task.id)} className="p-1 text-muted-foreground">
                            {expandedId === task.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        )}
                        <button onClick={() => deleteTask(task.id)} className="p-1 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Completed */}
      {completedTasks.length > 0 && (
        <div>
          <button onClick={() => setShowCompleted(!showCompleted)} className="text-sm text-muted-foreground flex items-center gap-1">
            {showCompleted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {completedTasks.length} completed
          </button>
          {showCompleted && (
            <div className="space-y-2 mt-2">
              {completedTasks.map((task) => (
                <Card key={task.id} className="opacity-60">
                  <CardContent className="p-3 flex items-center gap-3">
                    <button onClick={() => toggleTask(task.id)} className="h-5 w-5 rounded-md bg-primary flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </button>
                    <span className="text-sm line-through text-muted-foreground">{task.title}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Task Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>New Task</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pt-4 pb-6">
            <Input placeholder="Task title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus />
            <div className="flex gap-2">
              <Select value={newPriority} onValueChange={(v) => setNewPriority(v as Priority)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={newCategory} onValueChange={(v) => setNewCategory(v as TaskCategory)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
            <Button className="w-full" onClick={handleAdd}>Add Task</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Tasks;
