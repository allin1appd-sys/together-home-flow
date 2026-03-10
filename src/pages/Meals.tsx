import { useState } from 'react';
import { useHomeStore } from '@/stores/useHomeStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MealPlan, MealType, Recipe } from '@/types';
import { format, addDays, startOfWeek } from 'date-fns';

const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealEmoji: Record<MealType, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍿' };

const Meals = () => {
  const { mealPlans, recipes, addMealPlan, removeMealPlan, addRecipe } = useHomeStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [mealSheet, setMealSheet] = useState(false);
  const [recipeSheet, setRecipeSheet] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [mealName, setMealName] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');

  // Recipe form
  const [rName, setRName] = useState('');
  const [rInstructions, setRInstructions] = useState('');
  const [rPrepTime, setRPrepTime] = useState('15');
  const [rTags, setRTags] = useState('');

  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getMeal = (date: string, type: MealType) =>
    mealPlans.find((m) => m.date === date && m.mealType === type);

  const openMealSheet = (date: string, type: MealType) => {
    setSelectedDate(date);
    setSelectedMealType(type);
    setMealName('');
    setSelectedRecipeId('');
    setMealSheet(true);
  };

  const handleAddMeal = () => {
    if (!mealName.trim() && !selectedRecipeId) return;
    const recipe = recipes.find((r) => r.id === selectedRecipeId);
    addMealPlan({
      id: Date.now().toString(),
      date: selectedDate,
      mealType: selectedMealType,
      recipeId: selectedRecipeId || undefined,
      customMealName: mealName.trim() || recipe?.name || '',
    });
    setMealSheet(false);
  };

  const handleAddRecipe = () => {
    if (!rName.trim()) return;
    addRecipe({
      id: Date.now().toString(),
      name: rName.trim(),
      instructions: rInstructions,
      prepTime: parseInt(rPrepTime) || 0,
      cookTime: 0,
      servings: 2,
      tags: rTags.split(',').map((t) => t.trim()).filter(Boolean),
      ingredients: [],
    });
    setRName(''); setRInstructions(''); setRTags('');
    setRecipeSheet(false);
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meal Plan</h1>
        <Button size="sm" variant="outline" onClick={() => setRecipeSheet(true)} className="gap-1">
          <BookOpen className="h-4 w-4" /> Recipes
        </Button>
      </div>

      {/* Week nav */}
      <div className="flex items-center justify-between">
        <Button size="icon" variant="ghost" onClick={() => setWeekOffset(weekOffset - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(days[0], 'MMM d')} — {format(days[6], 'MMM d')}
        </span>
        <Button size="icon" variant="ghost" onClick={() => setWeekOffset(weekOffset + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="space-y-3">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
          return (
            <Card key={dateStr} className={cn(isToday && 'ring-2 ring-primary/30')}>
              <CardContent className="p-3">
                <p className={cn('text-xs font-semibold mb-2', isToday ? 'text-primary' : 'text-muted-foreground')}>
                  {format(day, 'EEE, MMM d')} {isToday && '· Today'}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {mealTypes.map((type) => {
                    const meal = getMeal(dateStr, type);
                    return (
                      <button
                        key={type}
                        onClick={() => meal ? removeMealPlan(meal.id) : openMealSheet(dateStr, type)}
                        className={cn(
                          'text-left rounded-lg p-2 text-xs transition-colors',
                          meal ? 'bg-accent' : 'bg-muted/50 hover:bg-muted'
                        )}
                      >
                        <span className="text-muted-foreground">{mealEmoji[type]} {type}</span>
                        {meal && <p className="font-medium mt-0.5 truncate text-foreground">{meal.customMealName}</p>}
                        {!meal && <p className="text-muted-foreground mt-0.5">+ Add</p>}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Meal Sheet */}
      <Sheet open={mealSheet} onOpenChange={setMealSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Add {selectedMealType} — {selectedDate && format(new Date(selectedDate + 'T12:00'), 'EEE, MMM d')}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pt-4 pb-6">
            <Input placeholder="Meal name" value={mealName} onChange={(e) => setMealName(e.target.value)} autoFocus />
            {recipes.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Or pick from recipes:</p>
                <Select value={selectedRecipeId} onValueChange={(v) => { setSelectedRecipeId(v); setMealName(''); }}>
                  <SelectTrigger><SelectValue placeholder="Choose recipe" /></SelectTrigger>
                  <SelectContent>
                    {recipes.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button className="w-full" onClick={handleAddMeal}>Add Meal</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Recipe Sheet */}
      <Sheet open={recipeSheet} onOpenChange={setRecipeSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Recipe Library</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pt-4 pb-6">
            {recipes.length > 0 && (
              <div className="space-y-2">
                {recipes.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.prepTime} min · {r.tags.join(', ')}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Add New Recipe</p>
              <div className="space-y-3">
                <Input placeholder="Recipe name" value={rName} onChange={(e) => setRName(e.target.value)} />
                <Textarea placeholder="Instructions" value={rInstructions} onChange={(e) => setRInstructions(e.target.value)} rows={3} />
                <Input placeholder="Prep time (minutes)" type="number" value={rPrepTime} onChange={(e) => setRPrepTime(e.target.value)} />
                <Input placeholder="Tags (comma-separated)" value={rTags} onChange={(e) => setRTags(e.target.value)} />
                <Button className="w-full" onClick={handleAddRecipe}>Save Recipe</Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Meals;
