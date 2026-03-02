"use client";

import { useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ITEM_TYPE_CONFIG, type ItemType } from "@/types";
import { AddItemDialog } from "@/components/add-item-dialog";

interface TimelineProps {
  tripId: string;
  days: Date[];
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
  onRefresh: () => void;
}

function getItemsForDay(items: TimelineProps["items"], day: Date) {
  const dayStr = format(day, "yyyy-MM-dd");
  return items.filter((item) => {
    const itemDate = format(new Date(item.date), "yyyy-MM-dd");
    return itemDate === dayStr;
  });
}

function parseMetadata(metadata: string | null) {
  if (!metadata) return {};
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
}

function ItemCard({
  item,
  onDelete,
}: {
  item: TimelineProps["items"][number];
  onDelete: (id: string) => void;
}) {
  const config = ITEM_TYPE_CONFIG[item.type as ItemType] || {
    label: "其他",
    emoji: "📌",
    color: "bg-gray-100 text-gray-800",
  };
  const meta = parseMetadata(item.metadata);

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-2xl mt-0.5">{config.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{item.title}</span>
                <Badge variant="secondary" className={`text-xs ${config.color}`}>
                  {config.label}
                </Badge>
                {item.startTime && (
                  <span className="text-xs text-muted-foreground">
                    {item.startTime}
                    {item.endTime && ` - ${item.endTime}`}
                  </span>
                )}
              </div>

              {/* Type-specific details */}
              {item.type === "flight" && meta.flightNo && (
                <div className="text-sm text-muted-foreground mt-1">
                  {meta.airline && `${meta.airline} `}
                  {meta.flightNo}
                  {meta.departAirport &&
                    meta.arriveAirport &&
                    ` · ${meta.departAirport} → ${meta.arriveAirport}`}
                  {meta.seat && ` · 座位 ${meta.seat}`}
                </div>
              )}

              {item.type === "hotel" && (
                <div className="text-sm text-muted-foreground mt-1">
                  {meta.checkIn && `入住 ${meta.checkIn}`}
                  {meta.checkOut && ` · 退房 ${meta.checkOut}`}
                  {meta.roomType && ` · ${meta.roomType}`}
                  {meta.confirmNo && ` · 确认号 ${meta.confirmNo}`}
                </div>
              )}

              {item.type === "restaurant" && (
                <div className="text-sm text-muted-foreground mt-1">
                  {meta.cuisine && `${meta.cuisine} `}
                  {meta.dishes &&
                    meta.dishes.length > 0 &&
                    `· 推荐：${meta.dishes.join("、")}`}
                </div>
              )}

              {item.type === "shop" && (
                <div className="text-sm text-muted-foreground mt-1">
                  {meta.items &&
                    meta.items.length > 0 &&
                    `想买：${meta.items.join("、")}`}
                  {meta.openHours && ` · 营业 ${meta.openHours}`}
                </div>
              )}

              {item.type === "attraction" && (
                <div className="text-sm text-muted-foreground mt-1">
                  {meta.duration && `游玩 ${meta.duration}`}
                  {meta.openHours && ` · 开放 ${meta.openHours}`}
                  {meta.tips && ` · 💡 ${meta.tips}`}
                </div>
              )}

              {item.type === "transport" && (
                <div className="text-sm text-muted-foreground mt-1">
                  {meta.mode && `${meta.mode}`}
                  {meta.from && meta.to && ` · ${meta.from} → ${meta.to}`}
                </div>
              )}

              {item.address && (
                <div className="text-xs text-muted-foreground mt-1">
                  📍 {item.address}
                </div>
              )}

              {item.notes && (
                <div className="text-xs text-muted-foreground mt-1">
                  💬 {item.notes}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-2">
            {item.cost != null && item.cost > 0 && (
              <span className="text-sm font-medium text-orange-600">
                ¥{item.cost.toLocaleString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 h-8 w-8 p-0"
              onClick={() => onDelete(item.id)}
            >
              ✕
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Timeline({ tripId, days, items, onRefresh }: TimelineProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  async function handleDeleteItem(itemId: string) {
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      onRefresh();
    } catch {
      // handle error silently
    }
  }

  function handleAddItem(day: Date) {
    setSelectedDate(day);
    setAddDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      {days.map((day, index) => {
        const dayItems = getItemsForDay(items, day);
        const dayOfWeek = format(day, "EEEE", { locale: zhCN });

        return (
          <div key={day.toISOString()}>
            {/* Day Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <span className="font-semibold">
                    {format(day, "M月d日", { locale: zhCN })}
                  </span>
                  <span className="text-muted-foreground ml-2 text-sm">
                    {dayOfWeek}
                  </span>
                </div>
              </div>
              <Separator className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddItem(day)}
              >
                + 添加
              </Button>
            </div>

            {/* Day Items */}
            {dayItems.length === 0 ? (
              <div className="ml-11 py-4 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                暂无行程，点击"+ 添加"开始规划
              </div>
            ) : (
              <div className="ml-11 space-y-2">
                {dayItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Add Item Dialog */}
      {selectedDate && (
        <AddItemDialog
          tripId={tripId}
          date={selectedDate}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSuccess={() => {
            setAddDialogOpen(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
