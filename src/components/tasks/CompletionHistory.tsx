import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Task } from '@/types';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

interface CompletionHistoryProps {
  tasks: Task[];
  onToggle: (id: string) => void;
}

function groupByDate(tasks: Task[]): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {};
  for (const t of tasks) {
    const key = t.completedAt ? format(parseISO(t.completedAt), 'yyyy-MM-dd') : 'unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return groups;
}

const CompletionHistory = ({ tasks, onToggle }: CompletionHistoryProps) => {
  const { t } = useTranslation();
  const sorted = [...tasks].sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  const grouped = groupByDate(sorted);
  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  function formatDateLabel(dateStr: string): string {
    if (dateStr === 'unknown') return t('common.unknown');
    const date = parseISO(dateStr);
    if (isToday(date)) return t('common.today');
    if (isYesterday(date)) return t('common.yesterday');
    return format(date, 'MMM d, yyyy');
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground font-serif italic">{t('tasks.noCompleted')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dateKeys.map((dateKey) => (
        <div key={dateKey}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {formatDateLabel(dateKey)}
          </p>
          <div className="space-y-1.5">
            {grouped[dateKey].map((task) => (
              <Card key={task.id} className="opacity-70">
                <CardContent className="p-3 flex items-center gap-3">
                  <button
                    onClick={() => onToggle(task.id)}
                    className="h-5 w-5 rounded-md bg-primary flex items-center justify-center shrink-0"
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm line-through text-muted-foreground">{task.title}</span>
                    {task.completedAt && (
                      <p className="text-[10px] text-muted-foreground/60">
                        {format(parseISO(task.completedAt), 'h:mm a')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompletionHistory;