import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMealPlans } from '@/hooks/data/useMealPlans';
import { useRecipes } from '@/hooks/data/useRecipes';
import { useGroceries } from '@/hooks/data/useGroceries';
import { useShoppingList } from '@/hooks/data/useShoppingList';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ChevronLeft, ChevronRight, BookOpen, Copy, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MealPlan, MealType, Recipe } from '@/types';
import { format, addDays, startOfWeek } from 'date-fns';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import PullToRefresh from '@/components/shared/PullToRefresh';

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealEmoji: Record<MealType, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍿' };
const SWIPE_THRESHOLD = -80;

const SwipeableMealCell = ({ meal, type, onTap, onDelete, mealLabel }: { meal: MealPlan | undefined; type: MealType; onTap: () => void; onDelete: () => void; mealLabel: string }) => {
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  if (!meal) return <button onClick={onTap} className="text-start rounded-lg p-2 text-xs transition-colors bg-muted/50 hover:bg-muted"><span className="text-muted-foreground">{mealEmoji[type]} {mealLabel}</span><p className="text-muted-foreground mt-0.5">+ Add</p></button>;
  return (
    <div className="relative overflow-hidden rounded-lg">
      <motion.div className="absolute inset-0 flex items-center justify-end pe-3 bg-destructive" style={{ opacity: bgOpacity }}><Trash2 className="h-4 w-4 text-destructive-foreground" /></motion.div>
      <motion.button className="relative text-start rounded-lg p-2 text-xs bg-accent w-full" style={{ x }} drag="x" dragConstraints={{ left: -120, right: 0 }} dragElastic={0.1} onDragEnd={(_: any, info: PanInfo) => { if (info.offset.x < SWIPE_THRESHOLD) onDelete(); }} onClick={onTap}>
        <span className="text-muted-foreground">{mealEmoji[type]} {mealLabel}</span>
        <p className="font-medium mt-0.5 truncate text-foreground">{meal.customMealName}</p>
      </motion.button>
    </div>
  );
};

const Meals = () => {
  const { t } = useTranslation();
  const { householdId } = useAuth();
  const { mealPlans, isLoading: mpLoading, addMealPlan, removeMealPlan, updateMealPlan, copyLastWeekMeals } = useMealPlans();
  const { recipes, addRecipe, removeRecipe } = useRecipes();
  const { groceries } = useGroceries();
  const { shoppingList, addShoppingItem } = useShoppingList();
  const [weekOffset, setWeekOffset] = useState(0);
  const [mealSheet, setMealSheet] = useState(false);
  const [recipeSheet, setRecipeSheet] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [mealName, setMealName] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteRecipeId, setDeleteRecipeId] = useState<string | null>(null);
  const [rName, setRName] = useState('');
  const [rInstructions, setRInstructions] = useState('');
  const [rPrepTime, setRPrepTime] = useState('15');
  const [rTags, setRTags] = useState('');

  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const getMeal = (date: string, type: MealType) => mealPlans.find((m) => m.date === date && m.mealType === type);

  const openMealSheet = (date: string, type: MealType, existingMeal?: MealPlan) => {
    setSelectedDate(date); setSelectedMealType(type);
    if (existingMeal) { setEditingMealId(existingMeal.id); setMealName(existingMeal.customMealName || ''); setSelectedRecipeId(existingMeal.recipeId || ''); }
    else { setEditingMealId(null); setMealName(''); setSelectedRecipeId(''); }
    setMealSheet(true);
  };

  const handleSaveMeal = () => {
    if (!mealName.trim() && !selectedRecipeId) return;
    const recipe = recipes.find((r) => r.id === selectedRecipeId);
    const name = mealName.trim() || recipe?.name || '';
    if (editingMealId) { updateMealPlan(editingMealId, { recipeId: selectedRecipeId || undefined, customMealName: name }); }
    else { addMealPlan({ id: Date.now().toString(), date: selectedDate, mealType: selectedMealType, recipeId: selectedRecipeId || undefined, customMealName: name }); }
    setMealSheet(false);
  };

  const handleCopyLastWeek = () => { copyLastWeekMeals(weekStartStr); toast.success(t('meals.copiedMeals')); };

  const handleAddRecipe = () => {
    if (!rName.trim()) return;
    addRecipe({ id: Date.now().toString(), name: rName.trim(), instructions: rInstructions, prepTime: parseInt(rPrepTime) || 0, cookTime: 0, servings: 2, tags: rTags.split(',').map(t2 => t2.trim()).filter(Boolean), ingredients: [] });
    setRName(''); setRInstructions(''); setRTags(''); setRecipeSheet(false);
  };

  const getMissingIngredients = (recipe: Recipe) => {
    const groceryNames = groceries.map(g => g.name.toLowerCase());
    return recipe.ingredients.filter(ing => !groceryNames.includes(ing.name.toLowerCase()));
  };

  const addMissingToShoppingList = (recipe: Recipe) => {
    const missing = getMissingIngredients(recipe);
    let added = 0;
    missing.forEach(ing => {
      const alreadyOnList = shoppingList.some(s => s.name.toLowerCase() === ing.name.toLowerCase());
      if (!alreadyOnList) { addShoppingItem({ id: `sl-${Date.now()}-${Math.random()}`, name: ing.name, quantity: parseInt(ing.quantity) || 1, category: 'other', isPurchased: false }); added++; }
    });
    if (added > 0) toast.success(t('meals.addedToList', { count: added }));
    else toast.info(t('meals.allOnList'));
  };

  if (mpLoading) return <div className="px-4 pt-6 space-y-4"><Skeleton className="h-8 w-32" /><div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div></div>;

  return (
    <PullToRefresh queryKeys={[['meal_plans', householdId!], ['recipes', householdId!]]}>
      <div className="px-4 pt-6 space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('meals.mealPlan')}</h1>
          <Button size="sm" variant="outline" onClick={() => setRecipeSheet(true)} className="gap-1"><BookOpen className="h-4 w-4" /> {t('meals.recipes')}</Button>
        </div>
        <div className="flex items-center justify-between">
          <Button size="icon" variant="ghost" onClick={() => setWeekOffset(weekOffset - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{format(days[0], 'MMM d')} — {format(days[6], 'MMM d')}</span>
            <Button size="sm" variant="ghost" onClick={handleCopyLastWeek} className="gap-1 text-xs h-7 px-2"><Copy className="h-3 w-3" /> {t('meals.copyLastWeek')}</Button>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setWeekOffset(weekOffset + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-3">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
            return (
              <Card key={dateStr} className={cn(isToday && 'ring-2 ring-primary/30')}>
                <CardContent className="p-3">
                  <p className={cn('text-xs font-semibold mb-2', isToday ? 'text-primary' : 'text-muted-foreground')}>{format(day, 'EEE, MMM d')} {isToday && `· ${t('common.today')}`}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {mealTypes.map((type) => { const meal = getMeal(dateStr, type); return <SwipeableMealCell key={type} meal={meal} type={type} mealLabel={t(`meals.${type}`)} onTap={() => meal ? openMealSheet(dateStr, type, meal) : openMealSheet(dateStr, type)} onDelete={() => meal && setDeleteId(meal.id)} />; })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Sheet open={mealSheet} onOpenChange={setMealSheet}>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader><SheetTitle>{editingMealId ? t('common.edit') : t('common.add')} {t(`meals.${selectedMealType}`)} — {selectedDate && format(new Date(selectedDate + 'T12:00'), 'EEE, MMM d')}</SheetTitle></SheetHeader>
            <div className="space-y-4 pt-4 pb-6">
              <Input placeholder={t('meals.mealName')} value={mealName} onChange={(e) => setMealName(e.target.value)} />
              {recipes.length > 0 && (
                <div><p className="text-xs text-muted-foreground mb-1.5">{t('meals.orPickFromRecipes')}</p>
                  <Select value={selectedRecipeId} onValueChange={(v) => { setSelectedRecipeId(v); setMealName(''); }}>
                    <SelectTrigger><SelectValue placeholder={t('meals.chooseRecipe')} /></SelectTrigger>
                    <SelectContent>{recipes.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <Button className="w-full" onClick={handleSaveMeal}>{editingMealId ? t('common.saveChanges') : t('meals.addMeal')}</Button>
              {editingMealId && <Button variant="destructive" className="w-full" onClick={() => setDeleteId(editingMealId)}><Trash2 className="h-4 w-4 me-1" /> {t('common.delete')}</Button>}
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={recipeSheet} onOpenChange={setRecipeSheet}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <SheetHeader><SheetTitle>{t('meals.recipeLibrary')}</SheetTitle></SheetHeader>
            <div className="space-y-4 pt-4 pb-6">
              {recipes.length > 0 && (
                <div className="space-y-2">
                  {recipes.map((r) => {
                    const missing = getMissingIngredients(r);
                    return (
                      <Card key={r.id}><CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{r.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{r.prepTime} min · {r.tags.join(', ')}</p>
                            {r.ingredients.length > 0 && missing.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive"><AlertCircle className="h-3 w-3" /> {t('meals.missing', { count: missing.length })}</span>
                                <button onClick={() => addMissingToShoppingList(r)} className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><ShoppingCart className="h-3 w-3" /> {t('meals.addToList')}</button>
                              </div>
                            )}
                            {r.ingredients.length > 0 && missing.length === 0 && <span className="inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 mt-1.5">{t('meals.allStocked')}</span>}
                          </div>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteRecipeId(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </CardContent></Card>
                    );
                  })}
                </div>
              )}
              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-3">{t('meals.addNewRecipe')}</p>
                <div className="space-y-3">
                  <Input placeholder={t('meals.recipeName')} value={rName} onChange={(e) => setRName(e.target.value)} />
                  <Textarea placeholder={t('meals.instructions')} value={rInstructions} onChange={(e) => setRInstructions(e.target.value)} rows={3} />
                  <Input placeholder={t('meals.prepTime')} type="number" value={rPrepTime} onChange={(e) => setRPrepTime(e.target.value)} />
                  <Input placeholder={t('meals.tags')} value={rTags} onChange={(e) => setRTags(e.target.value)} />
                  <Button className="w-full" onClick={handleAddRecipe}>{t('meals.saveRecipe')}</Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title={t('meals.deleteMeal')} description={t('meals.deleteMealDesc')} onConfirm={() => { if (deleteId) { removeMealPlan(deleteId); setMealSheet(false); } setDeleteId(null); }} />
        <ConfirmDialog open={!!deleteRecipeId} onOpenChange={(open) => !open && setDeleteRecipeId(null)} title={t('meals.deleteRecipe')} description={t('meals.deleteRecipeDesc')} onConfirm={() => { if (deleteRecipeId) removeRecipe(deleteRecipeId); setDeleteRecipeId(null); }} />
      </div>
    </PullToRefresh>
  );
};

export default Meals;