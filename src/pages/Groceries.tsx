import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGroceries } from '@/hooks/data/useGroceries';
import { useShoppingList } from '@/hooks/data/useShoppingList';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, Trash2, ShoppingCart, Check, AlertTriangle, DollarSign, Package } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GroceryItem, ShoppingListItem, StorageLocation, ShoppingCategory } from '@/types';
import { differenceInDays, parseISO } from 'date-fns';
import DatePicker from '@/components/shared/DatePicker';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import PullToRefresh from '@/components/shared/PullToRefresh';
import EmptyState from '@/components/shared/EmptyState';
import { grocerySchema } from '@/lib/validations';
import { toast } from 'sonner';

const storageLocations: StorageLocation[] = ['fridge', 'pantry', 'freezer', 'bathroom', 'cleaning'];
const shoppingCategories: ShoppingCategory[] = ['produce', 'dairy', 'meat', 'bakery', 'frozen', 'beverages', 'snacks', 'cleaning', 'personal-care', 'other'];

const SWIPE_THRESHOLD = -100;

const SwipeableGroceryCard = ({ item, onDecrement, onDelete, onEdit, statusLabel }: { item: GroceryItem; onDecrement: (id: string) => void; onDelete: (id: string) => void; onEdit: (item: GroceryItem) => void; statusLabel: Record<string, string> }) => {
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-120, -60, 0], [1, 0.6, 0]);
  const trashScale = useTransform(x, [-120, -60, 0], [1.2, 0.8, 0]);
  const handleDragEnd = () => { if (x.get() < SWIPE_THRESHOLD) onDelete(item.id); };
  const statusColor = { fresh: 'bg-success', expiring: 'bg-warning', expired: 'bg-destructive' };

  return (
    <div className="relative overflow-hidden rounded-lg">
      <motion.div className="absolute inset-0 bg-destructive flex items-center justify-end pe-6 rounded-lg" style={{ opacity: bgOpacity }}>
        <motion.div style={{ scale: trashScale }}><Trash2 className="h-6 w-6 text-destructive-foreground" /></motion.div>
      </motion.div>
      <motion.div drag="x" dragConstraints={{ left: -150, right: 0 }} dragElastic={0.1} onDragEnd={handleDragEnd} style={{ x }} className="relative z-10">
        <Card className="cursor-pointer" onClick={() => onEdit(item)}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className={cn('h-3 w-3 rounded-full shrink-0', statusColor[item.status])} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.name}</span>
                <Badge variant="secondary" className="text-[10px] capitalize">{item.storageLocation}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.quantity} {item.unit} · {statusLabel[item.status]}</p>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); onDecrement(item.id); }}>
              <Minus className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const Groceries = () => {
  const { t } = useTranslation();
  const { householdId } = useAuth();
  const { groceries, isLoading: gLoading, addGrocery, updateGrocery, removeGrocery, decrementGrocery } = useGroceries();
  const { shoppingList, isLoading: sLoading, addShoppingItem, toggleShoppingItem, clearCompletedShopping, suggestToShoppingList } = useShoppingList();
  const [tab, setTab] = useState('inventory');
  const [grocerySheet, setGrocerySheet] = useState(false);
  const [shoppingSheet, setShoppingSheet] = useState(false);
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingGrocery, setEditingGrocery] = useState<GroceryItem | null>(null);

  const [gName, setGName] = useState('');
  const [gQty, setGQty] = useState('1');
  const [gUnit, setGUnit] = useState('');
  const [gLocation, setGLocation] = useState<StorageLocation>('fridge');
  const [gCategory, setGCategory] = useState<ShoppingCategory>('other');
  const [gExpDate, setGExpDate] = useState('');

  const [sName, setSName] = useState('');
  const [sQty, setSQty] = useState('1');
  const [sCategory, setSCategory] = useState<ShoppingCategory>('other');
  const [sNote, setSNote] = useState('');
  const [sPrice, setSPrice] = useState('');

  const statusLabel: Record<string, string> = { fresh: t('groceries.fresh'), expiring: t('groceries.expiringSoon'), expired: t('groceries.expired') };

  const filtered = filterLocation === 'all' ? groceries : groceries.filter((g) => g.storageLocation === filterLocation);
  const activeShoppingItems = shoppingList.filter((i) => !i.isPurchased);
  const purchasedItems = shoppingList.filter((i) => i.isPurchased);

  const suggestable = groceries.filter(
    (g) => (g.status === 'expired' || g.status === 'expiring') && !shoppingList.some((s) => s.name.toLowerCase() === g.name.toLowerCase())
  );

  const grouped = shoppingCategories.reduce((acc, cat) => {
    const items = activeShoppingItems.filter((i) => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const estimatedTotal = activeShoppingItems.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);

  const openEditGrocery = (item: GroceryItem) => {
    setEditingGrocery(item);
    setGName(item.name); setGQty(String(item.quantity)); setGUnit(item.unit || '');
    setGLocation(item.storageLocation); setGCategory(item.category);
    setGExpDate(item.expirationDate || '');
    setGrocerySheet(true);
  };

  const openNewGrocery = () => {
    setEditingGrocery(null);
    setGName(''); setGQty('1'); setGUnit(''); setGExpDate('');
    setGLocation('fridge'); setGCategory('other');
    setGrocerySheet(true);
  };

  const handleSaveGrocery = () => {
    const parsed = grocerySchema.safeParse({
      name: gName, quantity: parseInt(gQty) || 0, unit: gUnit.trim() || undefined,
      category: gCategory, storageLocation: gLocation, expirationDate: gExpDate || undefined,
    });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }

    const computeStatus = (expDate?: string) => {
      if (!expDate) return 'fresh' as const;
      const days = differenceInDays(parseISO(expDate), new Date());
      return days < 0 ? 'expired' as const : days <= 3 ? 'expiring' as const : 'fresh' as const;
    };

    if (editingGrocery) {
      updateGrocery(editingGrocery.id, {
        name: gName.trim(), quantity: parseInt(gQty) || 1, unit: gUnit.trim() || undefined,
        category: gCategory, storageLocation: gLocation,
        expirationDate: gExpDate || undefined, status: computeStatus(gExpDate || undefined),
      });
    } else {
      const item: GroceryItem = {
        id: Date.now().toString(), name: gName.trim(), quantity: parseInt(gQty) || 1,
        unit: gUnit.trim() || undefined, category: gCategory, storageLocation: gLocation,
        purchaseDate: new Date().toISOString(), expirationDate: gExpDate || undefined,
        status: computeStatus(gExpDate || undefined),
      };
      addGrocery(item);
    }
    setGrocerySheet(false);
  };

  const handleAddShopping = () => {
    if (!sName.trim()) return;
    addShoppingItem({
      id: Date.now().toString(), name: sName.trim(), quantity: parseInt(sQty) || 1,
      category: sCategory, isPurchased: false, note: sNote || undefined,
      estimatedPrice: sPrice ? parseFloat(sPrice) : undefined,
    });
    setSName(''); setSQty('1'); setSNote(''); setSPrice('');
    setShoppingSheet(false);
  };

  const handleAddAllSuggestions = () => {
    suggestable.forEach((g) => suggestToShoppingList({ name: g.name, quantity: g.quantity, category: g.category }));
  };

  if (gLoading || sLoading) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      </div>
    );
  }

  return (
    <PullToRefresh queryKeys={[['groceries', householdId!], ['shopping_list', householdId!]]}>
      <div className="px-4 pt-6 space-y-4 pb-24">
        <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">{t('groceries.groceries')}</h1></div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="inventory" className="flex-1">{t('groceries.inventory')}</TabsTrigger>
            <TabsTrigger value="shopping" className="flex-1">{t('groceries.shoppingList')}</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-3 mt-3">
            {suggestable.length > 0 && (
              <Card className="border-warning/50 bg-warning/10">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">{t('groceries.itemsRunningLow', { count: suggestable.length })}</span>
                    <Button size="sm" variant="outline" className="ms-auto h-7 text-xs" onClick={handleAddAllSuggestions}>{t('groceries.addAllToList')}</Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestable.map((g) => (
                      <button key={g.id} onClick={() => suggestToShoppingList({ name: g.name, quantity: g.quantity, category: g.category })} className="text-xs bg-background border rounded-full px-2.5 py-1 hover:bg-accent transition-colors flex items-center gap-1">
                        <Plus className="h-3 w-3" /> {g.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="flex items-center gap-2">
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder={t('groceries.location')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('groceries.allLocations')}</SelectItem>
                  {storageLocations.map((l) => <SelectItem key={l} value={l} className="capitalize">{t(`groceries.${l}`)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={openNewGrocery} className="ms-auto gap-1"><Plus className="h-4 w-4" /> {t('common.add')}</Button>
            </div>
            {filtered.length === 0 ? (
              <EmptyState icon={Package} title={t('groceries.inventoryEmpty')} description={t('groceries.startTracking')} actionLabel={t('groceries.addItem')} onAction={openNewGrocery} />
            ) : (
              <AnimatePresence>
                {filtered.map((item) => (
                  <motion.div key={item.id} layout initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0, height: 0 }}>
                    <SwipeableGroceryCard item={item} onDecrement={decrementGrocery} onDelete={(id) => setDeleteId(id)} onEdit={openEditGrocery} statusLabel={statusLabel} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </TabsContent>

          <TabsContent value="shopping" className="space-y-3 mt-3">
            {estimatedTotal > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{t('groceries.estimatedTotal')}</span>
                  <span className="text-sm font-bold text-primary ms-auto">${estimatedTotal.toFixed(2)}</span>
                </CardContent>
              </Card>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('groceries.items', { count: activeShoppingItems.length })}</span>
              <div className="flex gap-2">
                {purchasedItems.length > 0 && <Button size="sm" variant="outline" onClick={clearCompletedShopping}>{t('groceries.clearDone')}</Button>}
                <Button size="sm" onClick={() => setShoppingSheet(true)} className="gap-1"><Plus className="h-4 w-4" /> {t('common.add')}</Button>
              </div>
            </div>
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 capitalize">{cat.replace('-', ' ')}</p>
                <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
                  {items.map((item) => (
                    <button key={item.id} onClick={() => toggleShoppingItem(item.id)} className="snap-start shrink-0">
                      <Card className="w-[140px] hover:bg-accent/50 transition-colors">
                        <CardContent className="p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center shrink-0" />
                            <span className="text-sm font-medium truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                            {item.estimatedPrice && <span className="text-xs text-primary font-medium">${item.estimatedPrice.toFixed(2)}</span>}
                          </div>
                          {item.note && <p className="text-[10px] text-muted-foreground truncate">{item.note}</p>}
                        </CardContent>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {activeShoppingItems.length === 0 && purchasedItems.length === 0 && (
              <EmptyState icon={ShoppingCart} title={t('groceries.shoppingListEmpty')} description={t('groceries.addItemsToList')} actionLabel={t('groceries.addItem')} onAction={() => setShoppingSheet(true)} />
            )}
            {purchasedItems.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">{t('groceries.gotIt')}</p>
                <div className="space-y-1.5 opacity-50">
                  {purchasedItems.map((item) => (
                    <button key={item.id} onClick={() => toggleShoppingItem(item.id)} className="w-full text-start">
                      <Card><CardContent className="p-3 flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0"><Check className="h-3 w-3 text-primary-foreground" /></div>
                        <span className="text-sm line-through">{item.name}</span>
                      </CardContent></Card>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Sheet open={grocerySheet} onOpenChange={setGrocerySheet}>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader><SheetTitle>{editingGrocery ? t('groceries.editGroceryItem') : t('groceries.addGroceryItem')}</SheetTitle></SheetHeader>
            <div className="space-y-4 pt-4 pb-6">
              <div className="space-y-1.5"><Label>{t('common.name')}</Label><Input placeholder={t('groceries.itemName')} value={gName} onChange={(e) => setGName(e.target.value)} /></div>
              <div className="flex gap-2">
                <div className="space-y-1.5 w-20"><Label>{t('groceries.qty')}</Label><Input type="number" value={gQty} onChange={(e) => setGQty(e.target.value)} /></div>
                <div className="space-y-1.5 flex-1"><Label>{t('groceries.unit')}</Label><Input placeholder="lbs, oz..." value={gUnit} onChange={(e) => setGUnit(e.target.value)} /></div>
              </div>
              <div className="flex gap-2">
                <div className="space-y-1.5 flex-1"><Label>{t('groceries.location')}</Label>
                  <Select value={gLocation} onValueChange={(v) => setGLocation(v as StorageLocation)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{storageLocations.map((l) => <SelectItem key={l} value={l} className="capitalize">{t(`groceries.${l}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 flex-1"><Label>{t('common.category')}</Label>
                  <Select value={gCategory} onValueChange={(v) => setGCategory(v as ShoppingCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{shoppingCategories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace('-', ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5"><Label>{t('groceries.expirationDate')}</Label><DatePicker value={gExpDate} onChange={setGExpDate} placeholder={t('groceries.noExpiration')} /></div>
              <Button className="w-full" onClick={handleSaveGrocery}>{editingGrocery ? t('common.saveChanges') : t('groceries.addToInventory')}</Button>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={shoppingSheet} onOpenChange={setShoppingSheet}>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader><SheetTitle>{t('groceries.addShoppingItem')}</SheetTitle></SheetHeader>
            <div className="space-y-4 pt-4 pb-6">
              <Input placeholder={t('groceries.itemName')} value={sName} onChange={(e) => setSName(e.target.value)} />
              <div className="flex gap-2">
                <Input type="number" placeholder={t('groceries.qty')} value={sQty} onChange={(e) => setSQty(e.target.value)} className="w-20" />
                <Select value={sCategory} onValueChange={(v) => setSCategory(v as ShoppingCategory)}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{shoppingCategories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace('-', ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Input placeholder={t('groceries.noteOptional')} value={sNote} onChange={(e) => setSNote(e.target.value)} />
              <Input type="number" step="0.01" placeholder={t('groceries.estimatedPrice')} value={sPrice} onChange={(e) => setSPrice(e.target.value)} />
              <Button className="w-full" onClick={handleAddShopping}>{t('groceries.addToList')}</Button>
            </div>
          </SheetContent>
        </Sheet>

        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title={t('groceries.deleteItem')}
          description={t('groceries.deleteItemDesc')}
          onConfirm={() => { if (deleteId) removeGrocery(deleteId); setDeleteId(null); }}
        />
      </div>
    </PullToRefresh>
  );
};

export default Groceries;