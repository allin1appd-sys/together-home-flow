import { useState } from 'react';
import { useHomeStore } from '@/stores/useHomeStore';
import { Note, NoteColor } from '@/types';
import { Plus, Pin, PinOff, Trash2 } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

const NOTE_COLORS: { value: NoteColor; bg: string; label: string }[] = [
  { value: 'yellow', bg: 'bg-yellow-100 dark:bg-yellow-900/40', label: 'Yellow' },
  { value: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/40', label: 'Blue' },
  { value: 'green', bg: 'bg-green-100 dark:bg-green-900/40', label: 'Green' },
  { value: 'pink', bg: 'bg-pink-100 dark:bg-pink-900/40', label: 'Pink' },
  { value: 'purple', bg: 'bg-purple-100 dark:bg-purple-900/40', label: 'Purple' },
  { value: 'orange', bg: 'bg-orange-100 dark:bg-orange-900/40', label: 'Orange' },
];

const colorBg = (color: NoteColor) => NOTE_COLORS.find((c) => c.value === color)?.bg ?? '';

const settle = { type: 'spring' as const, stiffness: 300, damping: 25 };

function NoteCard({ note, onEdit, onDelete, onTogglePin }: { note: Note; onEdit: () => void; onDelete: () => void; onTogglePin: () => void }) {
  const x = useMotionValue(0);
  const bg = useTransform(x, [-120, -60, 0], ['hsl(0 72% 51%)', 'hsl(0 72% 65%)', 'hsl(0 0% 100% / 0)']);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={settle}
      className="relative overflow-hidden rounded-xl"
    >
      <motion.div className="absolute inset-0 flex items-center justify-end pr-4 rounded-xl" style={{ backgroundColor: bg }}>
        <Trash2 className="h-5 w-5 text-white" />
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        style={{ x }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -100) onDelete();
        }}
        onClick={onEdit}
        className={cn('relative p-4 rounded-xl border border-border/40 cursor-pointer', colorBg(note.color))}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 flex-1">{note.title}</h3>
          <button onClick={(e) => { e.stopPropagation(); onTogglePin(); }} className="shrink-0 p-1 -m-1">
            {note.isPinned ? <Pin className="h-4 w-4 text-primary fill-primary" /> : <PinOff className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>
        {note.body && <p className="text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap">{note.body}</p>}
        <p className="text-[10px] text-muted-foreground/60 mt-2">{format(new Date(note.updatedAt), 'MMM d, h:mm a')}</p>
      </motion.div>
    </motion.div>
  );
}

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote, toggleNotePin } = useHomeStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState<NoteColor>('yellow');
  const [isPinned, setIsPinned] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sorted = [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setBody('');
    setColor('yellow');
    setIsPinned(false);
    setSheetOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditing(note);
    setTitle(note.title);
    setBody(note.body ?? '');
    setColor(note.color);
    setIsPinned(note.isPinned);
    setSheetOpen(true);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    if (editing) {
      updateNote({ ...editing, title: title.trim(), body: body.trim() || undefined, color, isPinned, updatedAt: now });
    } else {
      addNote({ id: `note-${Date.now()}`, title: title.trim(), body: body.trim() || undefined, color, isPinned, createdAt: now, updatedAt: now });
    }
    setSheetOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-foreground">Notes</h1>
        <p className="text-sm text-muted-foreground">Your shared family board</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-sm">No notes yet. Tap + to add one.</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 space-y-3 pt-2">
            <AnimatePresence mode="popLayout">
              {sorted.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={() => openEdit(note)}
                  onDelete={() => setDeleteId(note.id)}
                  onTogglePin={() => toggleNotePin(note.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <button
        onClick={openNew}
        className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader>
            <SheetTitle>{editing ? 'Edit Note' : 'New Note'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pt-4">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Body (optional)" value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Color</Label>
              <div className="flex gap-2">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={cn('h-8 w-8 rounded-full border-2 transition-all', c.bg, color === c.value ? 'border-primary scale-110' : 'border-transparent')}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pin-toggle" className="text-sm">Pin to top</Label>
              <Switch id="pin-toggle" checked={isPinned} onCheckedChange={setIsPinned} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={!title.trim()}>
              {editing ? 'Save Changes' : 'Add Note'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete note?"
        description="This note will be permanently removed."
        onConfirm={() => { if (deleteId) deleteNote(deleteId); setDeleteId(null); }}
      />
    </div>
  );
}
