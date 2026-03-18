import { useTranslation } from 'react-i18next';
import { useTransactions } from '@/hooks/data/useTransactions';
import { useBudgetLimits } from '@/hooks/data/useBudgetLimits';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Transaction, BudgetCategory } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import PullToRefresh from '@/components/shared/PullToRefresh';
import EmptyState from '@/components/shared/EmptyState';
import { transactionSchema } from '@/lib/validations';
import { toast } from 'sonner';

const BUDGET_CATEGORIES: BudgetCategory[] = ['housing', 'food', 'transport', 'utilities', 'entertainment', 'health', 'shopping', 'education', 'savings', 'other'];
const categoryColors: Record<BudgetCategory, string> = { housing: 'hsl(220, 70%, 55%)', food: 'hsl(30, 80%, 55%)', transport: 'hsl(280, 60%, 55%)', utilities: 'hsl(190, 70%, 45%)', entertainment: 'hsl(340, 70%, 55%)', health: 'hsl(150, 60%, 45%)', shopping: 'hsl(45, 80%, 50%)', education: 'hsl(260, 50%, 55%)', savings: 'hsl(120, 50%, 45%)', other: 'hsl(0, 0%, 55%)' };

const SwipeableTransaction = ({ transaction, onDelete, onEdit }: { transaction: Transaction; onDelete: () => void; onEdit: () => void }) => {
  const x = useMotionValue(0);
  const trashOpacity = useTransform(x, [-100, -50], [1, 0]);
  return (
    <div className="relative overflow-hidden rounded-xl">
      <motion.div className="absolute inset-0 bg-destructive flex items-center justify-end pe-6 rounded-xl" style={{ opacity: trashOpacity }}><Trash2 className="h-5 w-5 text-destructive-foreground" /></motion.div>
      <motion.div style={{ x }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.3}
        onDragEnd={(_, info) => { if (info.offset.x < -100) { animate(x, -400, { duration: 0.2 }); setTimeout(onDelete, 200); } else { animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 }); } }}
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
        <Card className="cursor-pointer" onClick={onEdit}><CardContent className="p-3 flex items-center justify-between">
          <div className="min-w-0 flex-1"><p className="font-medium text-sm truncate">{transaction.description}</p><div className="flex items-center gap-2 mt-0.5"><Badge variant="outline" className="text-xs capitalize">{transaction.category}</Badge><span className="text-xs text-muted-foreground">{format(parseISO(transaction.date), 'MMM d')}</span></div></div>
          <span className={`font-semibold text-sm ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}</span>
        </CardContent></Card>
      </motion.div>
    </div>
  );
};

const Budget = () => {
  const { t } = useTranslation();
  const { householdId } = useAuth();
  const { transactions, isLoading: tLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { budgetLimits, isLoading: bLoading } = useBudgetLimits();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [form, setForm] = useState({ description: '', amount: '', category: 'food' as BudgetCategory, type: 'expense' as 'income' | 'expense' });

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const monthlyTransactions = useMemo(() => transactions.filter(t2 => isWithinInterval(parseISO(t2.date), { start: monthStart, end: monthEnd })), [transactions, monthStart.getTime(), monthEnd.getTime()]);
  const totalIncome = monthlyTransactions.filter(t2 => t2.type === 'income').reduce((s, t2) => s + t2.amount, 0);
  const totalExpenses = monthlyTransactions.filter(t2 => t2.type === 'expense').reduce((s, t2) => s + t2.amount, 0);
  const balance = totalIncome - totalExpenses;

  const categoryData = useMemo(() => {
    const map = new Map<BudgetCategory, number>();
    monthlyTransactions.filter(t2 => t2.type === 'expense').forEach(t2 => map.set(t2.category, (map.get(t2.category) || 0) + t2.amount));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [monthlyTransactions]);

  const openNew = () => { setEditingTransaction(null); setForm({ description: '', amount: '', category: 'food', type: 'expense' }); setSheetOpen(true); };
  const openEdit = (t2: Transaction) => {
    setEditingTransaction(t2);
    setForm({ description: t2.description, amount: String(t2.amount), category: t2.category, type: t2.type });
    setSheetOpen(true);
  };

  const handleSave = () => {
    const parsed = transactionSchema.safeParse({
      description: form.description, amount: parseFloat(form.amount) || 0,
      category: form.category, type: form.type,
    });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }

    if (editingTransaction) {
      updateTransaction({ ...editingTransaction, description: form.description.trim(), amount: parseFloat(form.amount), category: form.category, type: form.type });
    } else {
      addTransaction({ id: `txn-${Date.now()}`, description: form.description.trim(), amount: parseFloat(form.amount), category: form.category, date: format(new Date(), 'yyyy-MM-dd'), type: form.type });
    }
    setForm({ description: '', amount: '', category: 'food', type: 'expense' }); setSheetOpen(false);
  };

  if (tLoading || bLoading) return <div className="px-4 pt-6 space-y-4 pb-24"><Skeleton className="h-8 w-24" /><div className="grid grid-cols-3 gap-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div></div>;

  return (
    <PullToRefresh queryKeys={[['transactions', householdId!], ['budget_limits', householdId!]]}>
      <div className="px-4 pt-6 pb-24 space-y-4">
        <h1 className="text-2xl font-bold">{t('budget.budget')}</h1>
        <div className="grid grid-cols-3 gap-2">
          <Card><CardContent className="p-3 text-center"><TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto mb-1" /><p className="text-xs text-muted-foreground">{t('budget.income')}</p><p className="font-bold text-sm text-green-600 dark:text-green-400">${totalIncome.toFixed(0)}</p></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 mx-auto mb-1" /><p className="text-xs text-muted-foreground">{t('budget.expenses')}</p><p className="font-bold text-sm text-red-600 dark:text-red-400">${totalExpenses.toFixed(0)}</p></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><DollarSign className="h-4 w-4 text-primary mx-auto mb-1" /><p className="text-xs text-muted-foreground">{t('dashboard.balance')}</p><p className={`font-bold text-sm ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>${balance.toFixed(0)}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="transactions">
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="transactions">{t('budget.transactions')}</TabsTrigger><TabsTrigger value="breakdown">{t('budget.breakdown')}</TabsTrigger></TabsList>
          <TabsContent value="transactions" className="space-y-2 mt-3">
            {monthlyTransactions.length === 0 ? (
              <EmptyState icon={DollarSign} title={t('budget.noTransactions')} description={t('budget.startTracking')} actionLabel={t('budget.addTransaction')} onAction={openNew} />
            ) : monthlyTransactions.sort((a, b) => b.date.localeCompare(a.date)).map(t2 => <SwipeableTransaction key={t2.id} transaction={t2} onDelete={() => setDeleteId(t2.id)} onEdit={() => openEdit(t2)} />)}
          </TabsContent>
          <TabsContent value="breakdown" className="mt-3 space-y-4">
            {categoryData.length > 0 && (
              <div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={2}>{categoryData.map(entry => <Cell key={entry.name} fill={categoryColors[entry.name as BudgetCategory]} />)}</Pie><Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} /></PieChart></ResponsiveContainer></div>
            )}
            <div className="space-y-3">
              {BUDGET_CATEGORIES.map(cat => {
                const spent = categoryData.find(d => d.name === cat)?.value || 0;
                const limit = budgetLimits.find(b => b.category === cat)?.limit;
                if (spent === 0 && !limit) return null;
                const pct = limit ? Math.min((spent / limit) * 100, 100) : 0;
                return <div key={cat} className="space-y-1"><div className="flex items-center justify-between text-sm"><span className="capitalize font-medium">{t(`budget.${cat}`)}</span><span className="text-muted-foreground">${spent.toFixed(0)}{limit ? ` / $${limit}` : ''}</span></div>{limit && <Progress value={pct} className="h-2" />}</div>;
              })}
            </div>
          </TabsContent>
        </Tabs>

        <motion.button className="fixed bottom-24 end-5 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center" whileTap={{ scale: 0.9 }} onClick={openNew}><Plus className="h-6 w-6" /></motion.button>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <SheetHeader><SheetTitle>{editingTransaction ? t('budget.editTransaction') : t('budget.addTransactionTitle')}</SheetTitle><SheetDescription>{editingTransaction ? t('budget.updateDetails') : t('budget.logIncomeExpense')}</SheetDescription></SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-2"><Button variant={form.type === 'expense' ? 'default' : 'outline'} onClick={() => setForm({ ...form, type: 'expense' })}>{t('budget.expense')}</Button><Button variant={form.type === 'income' ? 'default' : 'outline'} onClick={() => setForm({ ...form, type: 'income' })}>{t('budget.income')}</Button></div>
              <div className="space-y-1.5"><Label>{t('common.description')}</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Coffee, Rent, Salary..." /></div>
              <div className="space-y-1.5"><Label>{t('budget.amount')}</Label><Input type="number" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></div>
              <div className="space-y-1.5"><Label>{t('common.category')}</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as BudgetCategory })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BUDGET_CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{t(`budget.${c}`)}</SelectItem>)}</SelectContent></Select></div>
              <Button className="w-full" onClick={handleSave} disabled={!form.description.trim() || !form.amount}>{editingTransaction ? t('common.saveChanges') : t('budget.addTransaction')}</Button>
            </div>
          </SheetContent>
        </Sheet>

        <ConfirmDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)} title={t('budget.deleteTransaction')} description={t('budget.deleteTransactionDesc')} onConfirm={() => { if (deleteId) deleteTransaction(deleteId); setDeleteId(null); }} />
      </div>
    </PullToRefresh>
  );
};

export default Budget;