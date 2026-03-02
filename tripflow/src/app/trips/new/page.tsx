"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      destination: formData.get("destination") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      budget: formData.get("budget") as string,
      currency: "CNY",
      notes: formData.get("notes") as string,
    };

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "创建失败");
      }

      const trip = await res.json();
      toast.success("旅行创建成功！");
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">✈️ 创建新旅行</CardTitle>
          <CardDescription>
            填写基本信息，开始规划你的旅程
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">旅行标题 *</Label>
              <Input
                id="title"
                name="title"
                placeholder="例如：东京五日游"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">目的地 *</Label>
              <Input
                id="destination"
                name="destination"
                placeholder="例如：日本东京"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">出发日期 *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">返回日期 *</Label>
                <Input id="endDate" name="endDate" type="date" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">预算（元）</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                placeholder="例如：10000"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="关于这次旅行的备注..."
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "创建中..." : "创建旅行"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
