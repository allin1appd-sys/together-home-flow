import { useHomeStore } from '@/stores/useHomeStore';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingCategory } from '@/types';

const shoppingCategories: ShoppingCategory[] = ['produce', 'dairy', 'meat', 'bakery', 'frozen', 'beverages', 'snacks', 'cleaning', 'personal-care', 'other'];

const ShoppingList = () => {
  const { shoppingList, toggleShoppingItem, clearCompletedShopping } = useHomeStore();

  const active = shoppingList.filter((i) => !i.isPurchased);
  const purchased = shoppingList.filter((i) => i.isPurchased);

  const grouped = shoppingCategories.reduce((acc, cat) => {
    const items = active.filter((i) => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, typeof active>);

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shopping List</h1>
        {purchased.length > 0 && (
          <Button size="sm" variant="outline" onClick={clearCompletedShopping}>Clear done</Button>
        )}
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 capitalize">{cat.replace('-', ' ')}</p>
          <div className="space-y-1.5">
            {items.map((item) => (
              <button key={item.id} onClick={() => toggleShoppingItem(item.id)} className="w-full text-left">
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0" />
                    <span className="text-sm flex-1">{item.name}</span>
                    <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      ))}

      {active.length === 0 && purchased.length === 0 && (
        <div className="text-center py-16">
          <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Your shopping list is empty</p>
        </div>
      )}

      {purchased.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Got it ✓</p>
          <div className="space-y-1.5 opacity-50">
            {purchased.map((item) => (
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
    </div>
  );
};

export default ShoppingList;
