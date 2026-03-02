"use client";

import { useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { EXPENSE_CATEGORY_CONFIG, type ExpenseCategory } from "@/types";

interface ExpenseTabProps {
  tripId: string;
  expenses: Array<{
    id: string;
    tripId: string;
    itemId: string | null;
    category: string;
    amount: number;
    currency: string;
    description: string | null;
    paidBy: string | null;
    date: Date;
    createdAt: Date;
  }>;
  items: Array<{
    id: string;
    title: string;
    type: string;
  }>;
  budget: number | null;
  onRefresh: () => void;
}

export function ExpenseTab({
  tripId,
  expenses,
  items,
  budget,
  onRefresh,
}: ExpenseTabProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group expenses by category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  async function handleAddExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      tripId,
      category: formData.get("category") as string,
      amount: parseFloat(formData.get("amount") as string),
      description: (formData.get("description") as string) || null,
      paidBy: (formData.get("paidBy") as string) || null,
      date: (formData.get("date") as string) || new Date().toISOString(),
      itemId: (formData.get("itemId") as string) || null,
    };

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("添加失败");

      toast.success("费用已记录");
      setAddOpen(false);
      onRefresh();
    } catch {
      toast.error("添加失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteExpense(expenseId: string) {
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("删除失败");
      onRefresh();
    } catch {
      toast.error("删除失败");
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              总支出
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{totalExpense.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {budget && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  预算
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{budget.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  剩余
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${budget - totalExpense < 0 ? "text-red-500" : "text-green-600"}`}
                >
                  ¥{(budget - totalExpense).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Category breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">分类统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryTotals).map(([cat, total]) => {
                const config =
                  EXPENSE_CATEGORY_CONFIG[cat as ExpenseCategory] ||
                  EXPENSE_CATEGORY_CONFIG.other;
                const percentage =
                  totalExpense > 0
                    ? Math.round((total / totalExpense) * 100)
                    : 0;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-lg w-8">{config.emoji}</span>
                    <span className="w-16 text-sm">{config.label}</span>
                    <div className="flex-1 bg-muted rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: config.color,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-24 text-right">
                      ¥{total.toLocaleString()} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add expense button */}
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>+ 添加费用</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>记录费用</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exp-category">分类 *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EXPENSE_CATEGORY_CONFIG).map(
                      ([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.emoji} {config.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp-amount">金额（元）*</Label>
                <Input
                  id="exp-amount"
                  name="amount"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp-date">日期 *</Label>
                <Input
                  id="exp-date"
                  name="date"
                  type="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp-description">描述</Label>
                <Textarea
                  id="exp-description"
                  name="description"
                  placeholder="这笔花费的说明..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp-paidBy">付款人</Label>
                <Input
                  id="exp-paidBy"
                  name="paidBy"
                  placeholder="谁付的款"
                />
              </div>

              {items.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="exp-itemId">关联行程</Label>
                  <Select name="itemId">
                    <SelectTrigger>
                      <SelectValue placeholder="选择关联的行程（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "添加中..." : "添加"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expense list */}
      {expenses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-2">💰</div>
          <p>还没有费用记录</p>
          <p className="text-sm">点击"添加费用"开始记账</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => {
            const config =
              EXPENSE_CATEGORY_CONFIG[expense.category as ExpenseCategory] ||
              EXPENSE_CATEGORY_CONFIG.other;
            return (
              <Card key={expense.id} className="group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{config.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {expense.description || config.label}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(expense.date), "M月d日", {
                          locale: zhCN,
                        })}
                        {expense.paidBy && ` · ${expense.paidBy} 付`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-orange-600">
                      ¥{expense.amount.toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 h-8 w-8 p-0"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
