import { useState } from 'react';
import { useShoppingList } from '@/hooks/data/useShoppingList';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ShoppingCart, DollarSign, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ShoppingCategory, ShoppingListItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import PullToRefresh from '@/components/shared/PullToRefresh';
import EmptyState from '@/components/shared/EmptyState';

const shoppingCategories: ShoppingCategory[] = ['produce', 'dairy', 'meat', 'bakery', 'frozen', 'beverages', 'snacks', 'cleaning', 'personal-care', 'other'];

const ShoppingList = () => {
  const { householdId } = useAuth();
  const { shoppingList, isLoading, toggleShoppingItem, clearCompletedShopping, addShoppingItem, updateShoppingItem } = useShoppingList();
  const [quickAdd, setQuickAdd] = useState('');
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [editSheet, setEditSheet] = useState(false);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('1');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState<ShoppingCategory>('other');
  const [editNote, setEditNote] = useState('');

  const active = shoppingList.filter((i) => !i.isPurchased);
  const purchased = shoppingList.filter((i) => i.isPurchased);

  const grouped = shoppingCategories.reduce((acc, cat) => {
    const items = active.filter((i) => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, typeof active>);

  const estimatedTotal = active.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);

  const handleQuickAdd = () => {
    if (!quickAdd.trim()) return;
    addShoppingItem({ id: `sl-${Date.now()}`, name: quickAdd.trim(), quantity: 1, category: 'other', isPurchased: false });
    setQuickAdd('');
  };

  const openEdit = (item: ShoppingListItem) => {
    setEditingItem(item); setEditName(item.name); setEditQty(String(item.quantity));
    setEditPrice(item.estimatedPrice ? String(item.estimatedPrice) : '');
    setEditCategory(item.category); setEditNote(item.note || ''); setEditSheet(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem || !editName.trim()) return;
    updateShoppingItem(editingItem.id, {
      name: editName.trim(), quantity: parseInt(editQty) || 1,
      estimatedPrice: editPrice ? parseFloat(editPrice) : undefined,
      category: editCategory, note: editNote.trim() || undefined,
    });
    setEditSheet(false);
  };

  if (isLoading) {
    return <div className="px-4 pt-6 space-y-4 pb-24"><Skeleton className="h-8 w-40" /><div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div></div>;
  }

  return (
    <PullToRefresh queryKeys={[['shopping_list', householdId!]]}>
      <div className="px-4 pt-6 space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Shopping List</h1>
          {purchased.length > 0 && <Button size="sm" variant="outline" onClick={clearCompletedShopping}>Clear done</Button>}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Quick add item..." value={quickAdd} onChange={(e) => setQuickAdd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()} className="flex-1" />
          <Button size="icon" onClick={handleQuickAdd} disabled={!quickAdd.trim()}><Plus className="h-4 w-4" /></Button>
        </div>
        {estimatedTotal > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Estimated total:</span>
              <span className="text-sm font-bold text-primary ml-auto">${estimatedTotal.toFixed(2)}</span>
            </CardContent>
          </Card>
        )}
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 capitalize">{cat.replace('-', ' ')}</p>
            <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
              {items.map((item) => (
                <div key={item.id} className="snap-start shrink-0 relative">
                  <button onClick={() => toggleShoppingItem(item.id)}>
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
                  <button onClick={() => openEdit(item)} className="absolute top-1 right-1 p-1 rounded-md bg-background/80 text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {active.length === 0 && purchased.length === 0 && (
          <EmptyState icon={ShoppingCart} title="Shopping list is empty" description="Use the input above to add items" />
        )}
        {purchased.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Got it ✓</p>
            <div className="space-y-1.5 opacity-50">
              {purchased.map((item) => (
                <button key={item.id} onClick={() => toggleShoppingItem(item.id)} className="w-full text-left">
                  <Card><CardContent className="p-3 flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0"><Check className="h-3 w-3 text-primary-foreground" /></div>
                    <span className="text-sm line-through">{item.name}</span>
                  </CardContent></Card>
                </button>
              ))}
            </div>
          </div>
        )}
        <Sheet open={editSheet} onOpenChange={setEditSheet}>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader><SheetTitle>Edit Item</SheetTitle></SheetHeader>
            <div className="space-y-4 pt-4 pb-6">
              <div className="space-y-1.5"><Label>Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
              <div className="flex gap-2">
                <div className="space-y-1.5 w-20"><Label>Qty</Label><Input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} /></div>
                <div className="space-y-1.5 flex-1"><Label>Category</Label>
                  <Select value={editCategory} onValueChange={(v) => setEditCategory(v as ShoppingCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{shoppingCategories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace('-', ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Estimated price</Label><Input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="0.00" /></div>
              <div className="space-y-1.5"><Label>Note</Label><Input value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Optional" /></div>
              <Button className="w-full" onClick={handleSaveEdit} disabled={!editName.trim()}>Save Changes</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </PullToRefresh>
  );
};

export default ShoppingList;
