import { useState } from 'react';
import { useTrips } from '@/hooks/data/useTrips';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plane, MapPin, Calendar, Plus, Trash2, Clock } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Trip } from '@/types';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';

const TRIP_CATEGORIES = ['weekend getaway', 'vacation', 'business', 'road trip', 'adventure', 'other'];
const statusColor: Record<string, string> = { upcoming: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30', active: 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30', completed: 'bg-muted text-muted-foreground border-border' };

const SwipeableTripCard = ({ trip, onTap, onDelete }: { trip: Trip; onTap: () => void; onDelete: () => void }) => {
  const x = useMotionValue(0);
  const trashOpacity = useTransform(x, [-100, -50], [1, 0]);
  const daysUntil = differenceInDays(parseISO(trip.startDate), new Date());
  return (
    <div className="relative overflow-hidden rounded-xl">
      <motion.div className="absolute inset-0 bg-destructive flex items-center justify-end pr-6 rounded-xl" style={{ opacity: trashOpacity }}><Trash2 className="h-5 w-5 text-destructive-foreground" /></motion.div>
      <motion.div style={{ x }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.3}
        onDragEnd={(_, info) => { if (info.offset.x < -100) { animate(x, -400, { duration: 0.2 }); setTimeout(onDelete, 200); } else { animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 }); } }}
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
        <Card className="overflow-hidden cursor-pointer active:scale-[0.98] transition-transform" onClick={onTap}>
          <div className="h-20 bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center"><Plane className="h-7 w-7 text-primary" /></div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate">{trip.title}</h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{trip.destination}</span></div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1"><Calendar className="h-3 w-3 shrink-0" />{format(parseISO(trip.startDate), 'MMM d')} — {format(parseISO(trip.endDate), 'MMM d')}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5 ml-2">
                <Badge className={statusColor[trip.status]} variant="outline">{trip.status}</Badge>
                <span className="text-xs font-medium text-muted-foreground">{daysUntil <= 0 ? 'Now!' : `${daysUntil}d away`}</span>
              </div>
            </div>
            {trip.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{trip.description}</p>}
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              {(trip.itinerary?.length ?? 0) > 0 && <span>{trip.itinerary.length} activities</span>}
              {(trip.packingList?.length ?? 0) > 0 && <span>{trip.packingList.filter(p => p.isPacked).length}/{trip.packingList.length} packed</span>}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const emptyTrip = (): Omit<Trip, 'id'> => ({ title: '', destination: '', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd'), description: '', category: 'vacation', status: 'upcoming', itinerary: [], packingList: [] });

const Trips = () => {
  const { trips, isLoading, addTrip, updateTrip, deleteTrip } = useTrips();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [form, setForm] = useState<Omit<Trip, 'id'>>(emptyTrip());
  const [newActivity, setNewActivity] = useState({ time: '', description: '' });
  const [newPackingItem, setNewPackingItem] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => { setEditingTrip(null); setForm(emptyTrip()); setSheetOpen(true); };
  const openEdit = (trip: Trip) => { setEditingTrip(trip); setForm({ title: trip.title, destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate, description: trip.description || '', category: trip.category, status: trip.status, itinerary: trip.itinerary || [], packingList: trip.packingList || [] }); setSheetOpen(true); };

  const handleSave = () => {
    if (!form.title.trim() || !form.destination.trim()) return;
    if (editingTrip) { updateTrip({ ...editingTrip, ...form }); } else { addTrip({ id: `trip-${Date.now()}`, ...form }); }
    setSheetOpen(false);
  };

  const addActivity = () => {
    if (!newActivity.description.trim()) return;
    const tripDays = differenceInDays(parseISO(form.endDate), parseISO(form.startDate)) + 1;
    setForm({ ...form, itinerary: [...form.itinerary, { id: `act-${Date.now()}`, day: Math.min(form.itinerary.length + 1, tripDays), time: newActivity.time || '09:00', description: newActivity.description.trim() }] });
    setNewActivity({ time: '', description: '' });
  };

  const addPacking = () => {
    if (!newPackingItem.trim()) return;
    setForm({ ...form, packingList: [...form.packingList, { id: `pack-${Date.now()}`, name: newPackingItem.trim(), isPacked: false }] });
    setNewPackingItem('');
  };

  const togglePacking = (id: string) => setForm({ ...form, packingList: form.packingList.map(p => p.id === id ? { ...p, isPacked: !p.isPacked } : p) });
  const removePacking = (id: string) => setForm({ ...form, packingList: form.packingList.filter(p => p.id !== id) });
  const removeActivity = (id: string) => setForm({ ...form, itinerary: form.itinerary.filter(a => a.id !== id) });

  if (isLoading) return <div className="px-4 pt-6 space-y-4 pb-24"><Skeleton className="h-8 w-24" /><div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-48 w-full" />)}</div></div>;

  return (
    <div className="px-4 pt-6 pb-24 space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Trips</h1></div>
      {trips.length === 0 ? (
        <div className="text-center py-16"><Plane className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No trips planned yet</p></div>
      ) : (
        <div className="space-y-3">{trips.map(trip => <SwipeableTripCard key={trip.id} trip={trip} onTap={() => openEdit(trip)} onDelete={() => setDeleteId(trip.id)} />)}</div>
      )}
      <motion.button className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center" whileTap={{ scale: 0.9 }} onClick={openAdd}><Plus className="h-6 w-6" /></motion.button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader><SheetTitle>{editingTrip ? 'Edit Trip' : 'New Trip'}</SheetTitle><SheetDescription>{editingTrip ? 'Update trip details' : 'Plan a new adventure'}</SheetDescription></SheetHeader>
          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="details">Details</TabsTrigger><TabsTrigger value="itinerary">Itinerary</TabsTrigger><TabsTrigger value="packing">Packing</TabsTrigger></TabsList>
            <TabsContent value="details" className="space-y-4 mt-3">
              <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Beach Getaway" /></div>
              <div className="space-y-1.5"><Label>Destination</Label><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Santa Monica" /></div>
              <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div><div className="space-y-1.5"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Category</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TRIP_CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Trip['status'] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="upcoming">Upcoming</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select></div>
              </div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Notes about the trip..." rows={3} /></div>
            </TabsContent>
            <TabsContent value="itinerary" className="space-y-3 mt-3">
              <div className="flex gap-2"><Input className="w-20" type="time" value={newActivity.time} onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })} /><Input className="flex-1" value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} placeholder="Activity..." onKeyDown={(e) => e.key === 'Enter' && addActivity()} /><Button size="icon" variant="outline" onClick={addActivity}><Plus className="h-4 w-4" /></Button></div>
              {form.itinerary.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No activities yet</p> : form.itinerary.map(act => (
                <div key={act.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted"><Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" /><span className="text-xs font-medium text-muted-foreground w-12">{act.time}</span><span className="text-sm flex-1 truncate">{act.description}</span><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeActivity(act.id)}><Trash2 className="h-3 w-3" /></Button></div>
              ))}
            </TabsContent>
            <TabsContent value="packing" className="space-y-3 mt-3">
              <div className="flex gap-2"><Input className="flex-1" value={newPackingItem} onChange={(e) => setNewPackingItem(e.target.value)} placeholder="Item to pack..." onKeyDown={(e) => e.key === 'Enter' && addPacking()} /><Button size="icon" variant="outline" onClick={addPacking}><Plus className="h-4 w-4" /></Button></div>
              {form.packingList.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No items yet</p> : form.packingList.map(item => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted"><Checkbox checked={item.isPacked} onCheckedChange={() => togglePacking(item.id)} /><span className={`text-sm flex-1 ${item.isPacked ? 'line-through text-muted-foreground' : ''}`}>{item.name}</span><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removePacking(item.id)}><Trash2 className="h-3 w-3" /></Button></div>
              ))}
              {form.packingList.length > 0 && <p className="text-xs text-muted-foreground text-center">{form.packingList.filter(p => p.isPacked).length}/{form.packingList.length} packed</p>}
            </TabsContent>
          </Tabs>
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={handleSave} disabled={!form.title.trim() || !form.destination.trim()}>{editingTrip ? 'Update' : 'Add Trip'}</Button>
            {editingTrip && <Button variant="destructive" size="icon" onClick={() => setDeleteId(editingTrip.id)}><Trash2 className="h-4 w-4" /></Button>}
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title="Delete trip?" description="This trip and all its details will be permanently removed." onConfirm={() => { if (deleteId) { deleteTrip(deleteId); setSheetOpen(false); } setDeleteId(null); }} />
    </div>
  );
};

export default Trips;
