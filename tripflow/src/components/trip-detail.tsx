"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, eachDayOfInterval } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Timeline } from "@/components/timeline";
import { ExpenseTab } from "@/components/expense-tab";

interface TripDetailProps {
  trip: {
    id: string;
    title: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    coverImage: string | null;
    budget: number | null;
    currency: string;
    notes: string | null;
    items: Array<{
      id: string;
      tripId: string;
      type: string;
      date: Date;
      startTime: string | null;
      endTime: string | null;
      sortOrder: number;
      title: string;
      address: string | null;
      notes: string | null;
      cost: number | null;
      currency: string;
      metadata: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
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
    shares: Array<{
      id: string;
      tripId: string;
      code: string;
      password: string | null;
      expiresAt: Date | null;
      createdAt: Date;
    }>;
  };
}

export function TripDetail({ trip: initialTrip }: TripDetailProps) {
  const router = useRouter();
  const [trip, setTrip] = useState(initialTrip);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const totalExpense = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

  async function refreshTrip() {
    try {
      const res = await fetch(`/api/trips/${trip.id}`);
      if (res.ok) {
        const data = await res.json();
        setTrip(data);
      }
    } catch {
      // silently fail
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      destination: formData.get("destination") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      budget: formData.get("budget") as string,
      notes: formData.get("notes") as string,
    };

    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("更新失败");

      toast.success("旅行已更新");
      setEditOpen(false);
      refreshTrip();
      router.refresh();
    } catch {
      toast.error("更新失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");

      toast.success("旅行已删除");
      router.push("/");
    } catch {
      toast.error("删除失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Trip Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
            >
              ← 返回
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{trip.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <span>📍 {trip.destination}</span>
            <span>
              📅 {format(startDate, "M月d日", { locale: zhCN })} -{" "}
              {format(endDate, "M月d日", { locale: zhCN })}
            </span>
            <span>({days.length}天)</span>
          </div>
          {trip.budget && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">
                💰 预算 ¥{trip.budget.toLocaleString()}
              </Badge>
              <Badge
                variant="outline"
                className={
                  totalExpense > trip.budget ? "border-red-500 text-red-500" : ""
                }
              >
                已花 ¥{totalExpense.toLocaleString()}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                ✏️ 编辑
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑旅行</DialogTitle>
                <DialogDescription>修改旅行的基本信息</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">旅行标题</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={trip.title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-destination">目的地</Label>
                  <Input
                    id="edit-destination"
                    name="destination"
                    defaultValue={trip.destination}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-startDate">出发日期</Label>
                    <Input
                      id="edit-startDate"
                      name="startDate"
                      type="date"
                      defaultValue={format(startDate, "yyyy-MM-dd")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-endDate">返回日期</Label>
                    <Input
                      id="edit-endDate"
                      name="endDate"
                      type="date"
                      defaultValue={format(endDate, "yyyy-MM-dd")}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-budget">预算（元）</Label>
                  <Input
                    id="edit-budget"
                    name="budget"
                    type="number"
                    defaultValue={trip.budget?.toString() || ""}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">备注</Label>
                  <Textarea
                    id="edit-notes"
                    name="notes"
                    defaultValue={trip.notes || ""}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditOpen(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "保存中..." : "保存"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-500">
                🗑️ 删除
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>确认删除</DialogTitle>
                <DialogDescription>
                  删除后所有行程和费用记录将无法恢复，确定要删除"{trip.title}
                  "吗？
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "删除中..." : "确认删除"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="timeline">📅 行程</TabsTrigger>
          <TabsTrigger value="expenses">💰 记账</TabsTrigger>
          <TabsTrigger value="share">🔗 分享</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Timeline
            tripId={trip.id}
            days={days}
            items={trip.items}
            onRefresh={refreshTrip}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseTab
            tripId={trip.id}
            expenses={trip.expenses}
            items={trip.items}
            budget={trip.budget}
            onRefresh={refreshTrip}
          />
        </TabsContent>

        <TabsContent value="share">
          <div className="text-center py-12 text-muted-foreground">
            🔗 分享功能即将上线
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
