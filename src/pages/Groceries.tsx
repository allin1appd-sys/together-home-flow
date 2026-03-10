import { useState } from 'react';
import { useHomeStore } from '@/stores/useHomeStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, Trash2, ShoppingCart, Check, AlertTriangle, DollarSign } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GroceryItem, ShoppingListItem, StorageLocation, ShoppingCategory } from '@/types';
import { differenceInDays, parseISO } from 'date-fns';

const storageLocations: StorageLocation[] = ['fridge', 'pantry', 'freezer', 'bathroom', 'cleaning'];
const shoppingCategories: ShoppingCategory[] = ['produce', 'dairy', 'meat', 'bakery', 'frozen', 'beverages', 'snacks', 'cleaning', 'personal-care', 'other'];

const statusColor = { fresh: 'bg-success', expiring: 'bg-warning', expired: 'bg-destructive' };
const statusLabel = { fresh: 'Fresh', expiring: 'Expiring soon', expired: 'Expired' };

const SWIPE_THRESHOLD = -100;

/* ── Swipeable Grocery Card ── */
const SwipeableGroceryCard = ({ item, onDecrement, onDelete }: { item: GroceryItem; onDecrement: (id: string) => void; onDelete: (id: string) => void }) => {
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-120, -60, 0], [1, 0.6, 0]);
  const trashScale = useTransform(x, [-120, -60, 0], [1.2, 0.8, 0]);

  const handleDragEnd = () => {
    if (x.get() < SWIPE_THRESHOLD) {
      onDelete(item.id);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      <motion.div
        className="absolute inset-0 bg-destructive flex items-center justify-end pr-6 rounded-lg"
        style={{ opacity: bgOpacity }}
      >
        <motion.div style={{ scale: trashScale }}>
          <Trash2 className="h-6 w-6 text-destructive-foreground" />
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
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className={cn('h-3 w-3 rounded-full shrink-0', statusColor[item.status])} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.name}</span>
                <Badge variant="secondary" className="text-[10px] capitalize">{item.storageLocation}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.quantity} {item.unit} · {statusLabel[item.status]}</p>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => onDecrement(item.id)}>
              <Minus className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const Groceries = () => {
  const { groceries, shoppingList, addGrocery, removeGrocery, decrementGrocery, addShoppingItem, toggleShoppingItem, clearCompletedShopping, suggestToShoppingList } = useHomeStore();
  const [tab, setTab] = useState('inventory');
  const [grocerySheet, setGrocerySheet] = useState(false);
  const [shoppingSheet, setShoppingSheet] = useState(false);
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Grocery form
  const [gName, setGName] = useState('');
  const [gQty, setGQty] = useState('1');
  const [gUnit, setGUnit] = useState('');
  const [gLocation, setGLocation] = useState<StorageLocation>('fridge');
  const [gCategory, setGCategory] = useState<ShoppingCategory>('other');
  const [gExpDate, setGExpDate] = useState('');

  // Shopping form
  const [sName, setSName] = useState('');
  const [sQty, setSQty] = useState('1');
  const [sCategory, setSCategory] = useState<ShoppingCategory>('other');
  const [sNote, setSNote] = useState('');
  const [sPrice, setSPrice] = useState('');

  const filtered = filterLocation === 'all' ? groceries : groceries.filter((g) => g.storageLocation === filterLocation);
  const activeShoppingItems = shoppingList.filter((i) => !i.isPurchased);
  const purchasedItems = shoppingList.filter((i) => i.isPurchased);

  // Auto-suggest: expired/expiring items not already on shopping list
  const suggestable = groceries.filter(
    (g) => (g.status === 'expired' || g.status === 'expiring') && !shoppingList.some((s) => s.name.toLowerCase() === g.name.toLowerCase())
  );

  // Group shopping by category
  const grouped = shoppingCategories.reduce((acc, cat) => {
    const items = activeShoppingItems.filter((i) => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  // Estimated total
  const estimatedTotal = activeShoppingItems.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);

  const handleAddGrocery = () => {
    if (!gName.trim()) return;
    const item: GroceryItem = {
      id: Date.now().toString(),
      name: gName.trim(),
      quantity: parseInt(gQty) || 1,
      unit: gUnit.trim() || undefined,
      category: gCategory,
      storageLocation: gLocation,
      purchaseDate: new Date().toISOString(),
      expirationDate: gExpDate || undefined,
      status: gExpDate ? (differenceInDays(parseISO(gExpDate), new Date()) <= 3 ? (differenceInDays(parseISO(gExpDate), new Date()) < 0 ? 'expired' : 'expiring') : 'fresh') : 'fresh',
    };
    addGrocery(item);
    setGName(''); setGQty('1'); setGUnit(''); setGExpDate('');
    setGrocerySheet(false);
  };

  const handleAddShopping = () => {
    if (!sName.trim()) return;
    addShoppingItem({
      id: Date.now().toString(),
      name: sName.trim(),
      quantity: parseInt(sQty) || 1,
      category: sCategory,
      isPurchased: false,
      note: sNote || undefined,
      estimatedPrice: sPrice ? parseFloat(sPrice) : undefined,
    });
    setSName(''); setSQty('1'); setSNote(''); setSPrice('');
    setShoppingSheet(false);
  };

  const handleAddAllSuggestions = () => {
    suggestable.forEach((g) => suggestToShoppingList(g.id));
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Groceries</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="inventory" className="flex-1">Inventory</TabsTrigger>
          <TabsTrigger value="shopping" className="flex-1">Shopping List</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-3 mt-3">
          {/* Auto-suggest banner */}
          {suggestable.length > 0 && (
            <Card className="border-warning/50 bg-warning/10">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">{suggestable.length} item{suggestable.length > 1 ? 's' : ''} running low</span>
                  <Button size="sm" variant="outline" className="ml-auto h-7 text-xs" onClick={handleAddAllSuggestions}>
                    Add all to list
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestable.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => suggestToShoppingList(g.id)}
                      className="text-xs bg-background border rounded-full px-2.5 py-1 hover:bg-accent transition-colors flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> {g.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-2">
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {storageLocations.map((l) => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setGrocerySheet(true)} className="ml-auto gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Inventory is empty — <button onClick={() => setGrocerySheet(true)} className="text-primary underline">add your first item</button></p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((item) => (
                <motion.div key={item.id} layout initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0, height: 0 }}>
                  <SwipeableGroceryCard item={item} onDecrement={decrementGrocery} onDelete={removeGrocery} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        <TabsContent value="shopping" className="space-y-3 mt-3">
          {/* Estimated total */}
          {estimatedTotal > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Estimated total:</span>
                <span className="text-sm font-bold text-primary ml-auto">${estimatedTotal.toFixed(2)}</span>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{activeShoppingItems.length} item{activeShoppingItems.length !== 1 ? 's' : ''}</span>
            <div className="flex gap-2">
              {purchasedItems.length > 0 && (
                <Button size="sm" variant="outline" onClick={clearCompletedShopping}>Clear done</Button>
              )}
              <Button size="sm" onClick={() => setShoppingSheet(true)} className="gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </div>

          {/* Horizontal aisle carousels */}
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 capitalize">{cat.replace('-', ' ')}</p>
              <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleShoppingItem(item.id)}
                    className="snap-start shrink-0"
                  >
                    <Card className="w-[140px] hover:bg-accent/50 transition-colors">
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-primary flex items-center justify-center shrink-0" />
                          <span className="text-sm font-medium truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                          {item.estimatedPrice && (
                            <span className="text-xs text-primary font-medium">${item.estimatedPrice.toFixed(2)}</span>
                          )}
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
            <div className="text-center py-12">
              <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Shopping list is empty</p>
            </div>
          )}

          {purchasedItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Got it ✓</p>
              <div className="space-y-1.5 opacity-50">
                {purchasedItems.map((item) => (
                  <button key={item.id} onClick={() => toggleShoppingItem(item.id)} className="w-full text-left">
                    <Card>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                        <span className="text-sm line-through">{item.name}</span>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Grocery Sheet */}
      <Sheet open={grocerySheet} onOpenChange={setGrocerySheet}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader><SheetTitle>Add Grocery Item</SheetTitle></SheetHeader>
          <div className="space-y-4 pt-4 pb-6">
            <Input placeholder="Item name" value={gName} onChange={(e) => setGName(e.target.value)} autoFocus />
            <div className="flex gap-2">
              <Input type="number" placeholder="Qty" value={gQty} onChange={(e) => setGQty(e.target.value)} className="w-20" />
              <Input placeholder="Unit (e.g. lbs, oz)" value={gUnit} onChange={(e) => setGUnit(e.target.value)} className="flex-1" />
            </div>
            <div className="flex gap-2">
              <Select value={gLocation} onValueChange={(v) => setGLocation(v as StorageLocation)}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {storageLocations.map((l) => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={gCategory} onValueChange={(v) => setGCategory(v as ShoppingCategory)}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {shoppingCategories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace('-', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input type="date" placeholder="Expiration date" value={gExpDate} onChange={(e) => setGExpDate(e.target.value)} />
            <Button className="w-full" onClick={handleAddGrocery}>Add to Inventory</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Shopping Sheet */}
      <Sheet open={shoppingSheet} onOpenChange={setShoppingSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader><SheetTitle>Add Shopping Item</SheetTitle></SheetHeader>
          <div className="space-y-4 pt-4 pb-6">
            <Input placeholder="Item name" value={sName} onChange={(e) => setSName(e.target.value)} autoFocus />
            <div className="flex gap-2">
              <Input type="number" placeholder="Qty" value={sQty} onChange={(e) => setSQty(e.target.value)} className="w-20" />
              <Select value={sCategory} onValueChange={(v) => setSCategory(v as ShoppingCategory)}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {shoppingCategories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace('-', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Note (optional)" value={sNote} onChange={(e) => setSNote(e.target.value)} />
            <Input type="number" step="0.01" placeholder="Estimated price (optional)" value={sPrice} onChange={(e) => setSPrice(e.target.value)} />
            <Button className="w-full" onClick={handleAddShopping}>Add to List</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Groceries;
