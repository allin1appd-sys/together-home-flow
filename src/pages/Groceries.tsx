import { useState } from 'react';
import { useHomeStore } from '@/stores/useHomeStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, Trash2, ShoppingCart, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GroceryItem, ShoppingListItem, StorageLocation, ShoppingCategory } from '@/types';
import { differenceInDays, parseISO } from 'date-fns';

const storageLocations: StorageLocation[] = ['fridge', 'pantry', 'freezer', 'bathroom', 'cleaning'];
const shoppingCategories: ShoppingCategory[] = ['produce', 'dairy', 'meat', 'bakery', 'frozen', 'beverages', 'snacks', 'cleaning', 'personal-care', 'other'];

const statusColor = { fresh: 'bg-success', expiring: 'bg-warning', expired: 'bg-destructive' };
const statusLabel = { fresh: 'Fresh', expiring: 'Expiring soon', expired: 'Expired' };

const Groceries = () => {
  const { groceries, shoppingList, addGrocery, removeGrocery, decrementGrocery, addShoppingItem, toggleShoppingItem, clearCompletedShopping } = useHomeStore();
  const [tab, setTab] = useState('inventory');
  const [grocerySheet, setGrocerySheet] = useState(false);
  const [shoppingSheet, setShoppingSheet] = useState(false);
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Grocery form
  const [gName, setGName] = useState('');
  const [gQty, setGQty] = useState('1');
  const [gLocation, setGLocation] = useState<StorageLocation>('fridge');
  const [gCategory, setGCategory] = useState<ShoppingCategory>('other');
  const [gExpDate, setGExpDate] = useState('');

  // Shopping form
  const [sName, setSName] = useState('');
  const [sQty, setSQty] = useState('1');
  const [sCategory, setSCategory] = useState<ShoppingCategory>('other');
  const [sNote, setSNote] = useState('');

  const filtered = filterLocation === 'all' ? groceries : groceries.filter((g) => g.storageLocation === filterLocation);
  const activeShoppingItems = shoppingList.filter((i) => !i.isPurchased);
  const purchasedItems = shoppingList.filter((i) => i.isPurchased);

  // Group shopping by category
  const grouped = shoppingCategories.reduce((acc, cat) => {
    const items = activeShoppingItems.filter((i) => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const handleAddGrocery = () => {
    if (!gName.trim()) return;
    const item: GroceryItem = {
      id: Date.now().toString(),
      name: gName.trim(),
      quantity: parseInt(gQty) || 1,
      category: gCategory,
      storageLocation: gLocation,
      purchaseDate: new Date().toISOString(),
      expirationDate: gExpDate || undefined,
      status: gExpDate ? (differenceInDays(parseISO(gExpDate), new Date()) <= 3 ? (differenceInDays(parseISO(gExpDate), new Date()) < 0 ? 'expired' : 'expiring') : 'fresh') : 'fresh',
    };
    addGrocery(item);
    setGName(''); setGQty('1'); setGExpDate('');
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
    });
    setSName(''); setSQty('1'); setSNote('');
    setShoppingSheet(false);
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
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => decrementGrocery(item.id)}>
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeGrocery(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        <TabsContent value="shopping" className="space-y-3 mt-3">
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

          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 capitalize">{cat.replace('-', ' ')}</p>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <motion.div key={item.id} layout>
                    <button onClick={() => toggleShoppingItem(item.id)} className="w-full text-left">
                      <Card className="hover:bg-accent/50 transition-colors">
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                            {item.isPurchased && <Check className="h-3 w-3 text-primary" />}
                          </div>
                          <div className="flex-1">
                            <span className="text-sm">{item.name}</span>
                            {item.note && <span className="text-xs text-muted-foreground ml-2">({item.note})</span>}
                          </div>
                          <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                        </CardContent>
                      </Card>
                    </button>
                  </motion.div>
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
              <Select value={gLocation} onValueChange={(v) => setGLocation(v as StorageLocation)}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {storageLocations.map((l) => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}
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
            <Button className="w-full" onClick={handleAddShopping}>Add to List</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Groceries;
