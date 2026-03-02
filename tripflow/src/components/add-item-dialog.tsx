"use client";

import { useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ITEM_TYPE_CONFIG, type ItemType } from "@/types";

interface AddItemDialogProps {
  tripId: string;
  date: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const itemTypes = Object.entries(ITEM_TYPE_CONFIG) as [
  ItemType,
  (typeof ITEM_TYPE_CONFIG)[ItemType],
][];

export function AddItemDialog({
  tripId,
  date,
  open,
  onOpenChange,
  onSuccess,
}: AddItemDialogProps) {
  const [selectedType, setSelectedType] = useState<ItemType | null>(null);
  const [loading, setLoading] = useState(false);

  function handleClose() {
    setSelectedType(null);
    onOpenChange(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedType) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // Build metadata based on type
    const metadata: Record<string, unknown> = {};

    if (selectedType === "flight") {
      metadata.flightNo = formData.get("flightNo") || "";
      metadata.airline = formData.get("airline") || "";
      metadata.departAirport = formData.get("departAirport") || "";
      metadata.arriveAirport = formData.get("arriveAirport") || "";
      metadata.seat = formData.get("seat") || "";
      metadata.bookingRef = formData.get("bookingRef") || "";
    } else if (selectedType === "hotel") {
      metadata.checkIn = formData.get("checkIn") || "";
      metadata.checkOut = formData.get("checkOut") || "";
      metadata.roomType = formData.get("roomType") || "";
      metadata.confirmNo = formData.get("confirmNo") || "";
    } else if (selectedType === "restaurant") {
      const dishes = (formData.get("dishes") as string) || "";
      metadata.dishes = dishes
        .split(/[,，、]/)
        .map((d) => d.trim())
        .filter(Boolean);
      metadata.cuisine = formData.get("cuisine") || "";
    } else if (selectedType === "shop") {
      const items = (formData.get("items") as string) || "";
      metadata.items = items
        .split(/[,，、]/)
        .map((i) => i.trim())
        .filter(Boolean);
      metadata.openHours = formData.get("openHours") || "";
    } else if (selectedType === "attraction") {
      metadata.duration = formData.get("duration") || "";
      metadata.openHours = formData.get("openHours") || "";
      metadata.tips = formData.get("tips") || "";
    } else if (selectedType === "transport") {
      metadata.mode = formData.get("mode") || "";
      metadata.from = formData.get("from") || "";
      metadata.to = formData.get("to") || "";
    }

    const data = {
      tripId,
      type: selectedType,
      date: format(date, "yyyy-MM-dd"),
      title: formData.get("title") as string,
      startTime: (formData.get("startTime") as string) || null,
      endTime: (formData.get("endTime") as string) || null,
      address: (formData.get("address") as string) || null,
      notes: (formData.get("notes") as string) || null,
      cost: formData.get("cost")
        ? parseFloat(formData.get("cost") as string)
        : null,
      metadata: JSON.stringify(metadata),
    };

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("添加失败");

      toast.success("行程已添加");
      setSelectedType(null);
      onSuccess();
    } catch {
      toast.error("添加失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            添加行程 · {format(date, "M月d日 EEEE", { locale: zhCN })}
          </DialogTitle>
        </DialogHeader>

        {!selectedType ? (
          // Step 1: Choose type
          <div className="grid grid-cols-2 gap-3">
            {itemTypes.map(([type, config]) => (
              <Button
                key={type}
                variant="outline"
                className="h-16 text-left justify-start gap-3"
                onClick={() => setSelectedType(type)}
              >
                <span className="text-2xl">{config.emoji}</span>
                <span className="font-medium">{config.label}</span>
              </Button>
            ))}
          </div>
        ) : (
          // Step 2: Fill form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedType(null)}
              >
                ← 返回
              </Button>
              <span className="text-lg">
                {ITEM_TYPE_CONFIG[selectedType].emoji}{" "}
                {ITEM_TYPE_CONFIG[selectedType].label}
              </span>
            </div>

            {/* Common fields */}
            <div className="space-y-2">
              <Label htmlFor="title">
                {selectedType === "flight"
                  ? "航班描述"
                  : selectedType === "hotel"
                    ? "酒店名称"
                    : selectedType === "restaurant"
                      ? "餐厅名称"
                      : selectedType === "shop"
                        ? "店铺名称"
                        : selectedType === "attraction"
                          ? "景点名称"
                          : selectedType === "transport"
                            ? "交通描述"
                            : "标题"}{" "}
                *
              </Label>
              <Input
                id="title"
                name="title"
                placeholder={
                  selectedType === "flight"
                    ? "例如：北京→东京"
                    : selectedType === "hotel"
                      ? "例如：新宿希尔顿酒店"
                      : selectedType === "restaurant"
                        ? "例如：一蘭拉面"
                        : selectedType === "shop"
                          ? "例如：银座 MUJI 旗舰店"
                          : selectedType === "attraction"
                            ? "例如：浅草寺"
                            : selectedType === "transport"
                              ? "例如：机场→酒店"
                              : "输入标题"
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">开始时间</Label>
                <Input id="startTime" name="startTime" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">结束时间</Label>
                <Input id="endTime" name="endTime" type="time" />
              </div>
            </div>

            {/* Type-specific fields */}
            {selectedType === "flight" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flightNo">航班号</Label>
                    <Input
                      id="flightNo"
                      name="flightNo"
                      placeholder="例如：CA123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="airline">航空公司</Label>
                    <Input
                      id="airline"
                      name="airline"
                      placeholder="例如：国航"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departAirport">出发机场</Label>
                    <Input
                      id="departAirport"
                      name="departAirport"
                      placeholder="例如：PEK"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arriveAirport">到达机场</Label>
                    <Input
                      id="arriveAirport"
                      name="arriveAirport"
                      placeholder="例如：NRT"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seat">座位号</Label>
                    <Input id="seat" name="seat" placeholder="例如：32A" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingRef">预订号</Label>
                    <Input
                      id="bookingRef"
                      name="bookingRef"
                      placeholder="预订确认号"
                    />
                  </div>
                </div>
              </>
            )}

            {selectedType === "hotel" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkIn">入住时间</Label>
                    <Input
                      id="checkIn"
                      name="checkIn"
                      type="time"
                      defaultValue="14:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOut">退房时间</Label>
                    <Input
                      id="checkOut"
                      name="checkOut"
                      type="time"
                      defaultValue="11:00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomType">房间类型</Label>
                    <Input
                      id="roomType"
                      name="roomType"
                      placeholder="例如：大床房"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNo">确认号</Label>
                    <Input
                      id="confirmNo"
                      name="confirmNo"
                      placeholder="预订确认号"
                    />
                  </div>
                </div>
              </>
            )}

            {selectedType === "restaurant" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cuisine">菜系</Label>
                  <Input
                    id="cuisine"
                    name="cuisine"
                    placeholder="例如：日料、川菜、意大利菜"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dishes">推荐菜品</Label>
                  <Input
                    id="dishes"
                    name="dishes"
                    placeholder="用逗号分隔，例如：天然豚骨拉面、煎饺"
                  />
                </div>
              </>
            )}

            {selectedType === "shop" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="items">想买的东西</Label>
                  <Input
                    id="items"
                    name="items"
                    placeholder="用逗号分隔，例如：文具、收纳"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openHours">营业时间</Label>
                  <Input
                    id="openHours"
                    name="openHours"
                    placeholder="例如：10:00-21:00"
                  />
                </div>
              </>
            )}

            {selectedType === "attraction" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">游玩时长</Label>
                    <Input
                      id="duration"
                      name="duration"
                      placeholder="例如：2小时"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openHours">开放时间</Label>
                    <Input
                      id="openHours"
                      name="openHours"
                      placeholder="例如：06:00-17:00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tips">小贴士</Label>
                  <Input
                    id="tips"
                    name="tips"
                    placeholder="例如：早上去人少"
                  />
                </div>
              </>
            )}

            {selectedType === "transport" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mode">交通方式</Label>
                  <Input
                    id="mode"
                    name="mode"
                    placeholder="例如：地铁、出租车、巴士"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from">出发地</Label>
                    <Input id="from" name="from" placeholder="从哪里出发" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to">目的地</Label>
                    <Input id="to" name="to" placeholder="到哪里" />
                  </div>
                </div>
              </>
            )}

            {/* Common: address, cost, notes */}
            <div className="space-y-2">
              <Label htmlFor="address">地址</Label>
              <Input id="address" name="address" placeholder="详细地址" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">费用（元）</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                placeholder="预计或实际花费"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="其他备注信息..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "添加中..." : "添加"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
