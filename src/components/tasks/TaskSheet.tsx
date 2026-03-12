import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Task, Priority, TaskCategory, SubTask } from '@/types';
import { useFamilyMembers } from '@/hooks/data/useFamilyMembers';
import { format } from 'date-fns';
import DatePicker from '@/components/shared/DatePicker';

const categories: TaskCategory[] = ['cleaning', 'errands', 'repairs', 'kids', 'pets', 'cooking', 'shopping', 'other'];
const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

interface TaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask: Task | null;
  onAdd: (task: Task) => void;
  onUpdate: (task: Task) => void;
}

const TaskSheet = ({ open, onOpenChange, editingTask, onAdd, onUpdate }: TaskSheetProps) => {
  const { familyMembers } = useFamilyMembers();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [assignedTo, setAssignedTo] = useState('');
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [newSubTask, setNewSubTask] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title); setDescription(editingTask.description || '');
      setPriority(editingTask.priority); setCategory(editingTask.category);
      setDueDate(editingTask.dueDate || format(new Date(), 'yyyy-MM-dd'));
      setAssignedTo(editingTask.assignedTo || ''); setSubTasks([...editingTask.subTasks]);
    } else { resetForm(); }
  }, [editingTask, open]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setPriority('medium'); setCategory('other');
    setDueDate(format(new Date(), 'yyyy-MM-dd')); setAssignedTo(''); setSubTasks([]); setNewSubTask('');
  };

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) return;
    setSubTasks([...subTasks, { id: Date.now().toString(), title: newSubTask.trim(), isCompleted: false }]);
    setNewSubTask('');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (editingTask) {
      onUpdate({ ...editingTask, title: title.trim(), description: description.trim() || undefined, priority, category, dueDate, assignedTo: assignedTo || undefined, subTasks });
    } else {
      onAdd({ id: Date.now().toString(), title: title.trim(), description: description.trim() || undefined, priority, category, dueDate, assignedTo: assignedTo || undefined, isCompleted: false, isRecurring: false, subTasks, createdAt: new Date().toISOString() });
    }
    resetForm(); onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader><SheetTitle>{editingTask ? 'Edit Task' : 'New Task'}</SheetTitle></SheetHeader>
        <div className="space-y-4 pt-4 pb-6">
          <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[60px] resize-none" />
          <div className="flex gap-2">
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>{priorities.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="flex-1" />
            <Select value={assignedTo || '_none'} onValueChange={(v) => setAssignedTo(v === '_none' ? '' : v)}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Assign to..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Unassigned</SelectItem>
                {familyMembers.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">Sub-tasks</span>
            {subTasks.map((st) => (
              <div key={st.id} className="flex items-center gap-2">
                <span className="text-sm flex-1 truncate">{st.title}</span>
                <button onClick={() => setSubTasks(subTasks.filter(s => s.id !== st.id))} className="p-1 text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input placeholder="Add sub-task" value={newSubTask} onChange={(e) => setNewSubTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()} className="flex-1 h-8 text-sm" />
              <Button size="sm" variant="outline" onClick={handleAddSubTask} className="h-8 px-2"><Plus className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          <Button className="w-full" onClick={handleSubmit}>{editingTask ? 'Save Changes' : 'Add Task'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskSheet;
