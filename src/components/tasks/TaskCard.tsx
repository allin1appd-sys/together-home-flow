import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Task, Priority } from '@/types';
import { format } from 'date-fns';

const priorityColor: Record<Priority, string> = {
  urgent: 'bg-destructive text-destructive-foreground',
  high: 'bg-warning text-warning-foreground',
  medium: 'bg-primary text-primary-foreground',
  low: 'bg-muted text-muted-foreground',
};

const SWIPE_THRESHOLD = -100;

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onToggleSubTask: (taskId: string, subTaskId: string) => void;
}

const TaskCard = ({ task, onToggle, onDelete, onEdit, onToggleSubTask }: TaskCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-120, -60, 0], [1, 0.6, 0]);
  const checkScale = useTransform(x, [-120, -60, 0], [1.2, 0.8, 0]);

  const handleDragEnd = () => {
    if (x.get() < SWIPE_THRESHOLD) {
      onToggle(task.id);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Green reveal behind */}
      <motion.div
        className="absolute inset-0 bg-green-500 flex items-center justify-end pr-6 rounded-lg"
        style={{ opacity: bgOpacity }}
      >
        <motion.div style={{ scale: checkScale }}>
          <Check className="h-6 w-6 text-white" />
        </motion.div>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative z-10"
      >
        <Card className="cursor-pointer" onClick={() => onEdit(task)}>
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
                className="mt-0.5 h-5 w-5 rounded-md border-2 border-primary flex items-center justify-center shrink-0 transition-colors hover:bg-primary/10"
              >
                {task.isCompleted && <Check className="h-3 w-3 text-primary" />}
              </button>
              <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-medium truncate', task.isCompleted && 'line-through text-muted-foreground')}>{task.title}</span>
                  <Badge className={cn('text-[10px] px-1.5 py-0 shrink-0', priorityColor[task.priority])}>{task.priority}</Badge>
                </div>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground capitalize">{task.category}</span>
                  {task.dueDate && (
                    <span className="text-xs text-muted-foreground">
                      · {task.dueDate === format(new Date(), 'yyyy-MM-dd') ? 'Today' : task.dueDate}
                    </span>
                  )}
                </div>
                {/* Sub-tasks */}
                {task.subTasks.length > 0 && expanded && (
                  <div className="mt-2 space-y-1 pl-1">
                    {task.subTasks.map((st) => (
                      <button
                        key={st.id}
                        onClick={(e) => { e.stopPropagation(); onToggleSubTask(task.id, st.id); }}
                        className="flex items-center gap-2 w-full text-left"
                      >
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
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                    className="p-1 text-muted-foreground"
                  >
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                  className="p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TaskCard;
