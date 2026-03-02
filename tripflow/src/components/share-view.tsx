"use client";

import { format, eachDayOfInterval } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ITEM_TYPE_CONFIG, type ItemType, EXPENSE_CATEGORY_CONFIG, type ExpenseCategory } from "@/types";

interface ShareViewProps {
  trip: {
    id: string;
    title: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    budget: number | null;
    currency: string;
    notes: string | null;
    items: Array<{
      id: string;
      type: string;
      date: Date;
      startTime: string | null;
      endTime: string | null;
      title: string;
      address: string | null;
      notes: string | null;
      cost: number | null;
      currency: string;
      metadata: string | null;
    }>;
    expenses: Array<{
      id: string;
      category: string;
      amount: number;
      description: string | null;
      date: Date;
    }>;
  };
}

function parseMetadata(metadata: string | null) {
  if (!metadata) return {};
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
}

export function ShareView({ trip }: ShareViewProps) {
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const totalExpense = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-3">
          🔗 共享行程
        </Badge>
        <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
        <div className="text-muted-foreground space-x-3">
          <span>📍 {trip.destination}</span>
          <span>
            📅 {format(startDate, "M月d日", { locale: zhCN })} -{" "}
            {format(endDate, "M月d日", { locale: zhCN })}
          </span>
          <span>({days.length}天)</span>
        </div>
        {totalExpense > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            💰 总花费 ¥{totalExpense.toLocaleString()}
            {trip.budget && ` / 预算 ¥${trip.budget.toLocaleString()}`}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {days.map((day, index) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const dayItems = trip.items.filter(
            (item) => format(new Date(item.date), "yyyy-MM-dd") === dayStr
          );
          const dayOfWeek = format(day, "EEEE", { locale: zhCN });

          return (
            <div key={day.toISOString()}>
              <div className="flex items-center gap-3 mb-3">
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
                <Separator className="flex-1" />
              </div>

              {dayItems.length === 0 ? (
                <div className="ml-11 py-3 text-sm text-muted-foreground">
                  自由活动
                </div>
              ) : (
                <div className="ml-11 space-y-2">
                  {dayItems.map((item) => {
                    const config = ITEM_TYPE_CONFIG[item.type as ItemType] || {
                      label: "其他",
                      emoji: "📌",
                      color: "bg-gray-100 text-gray-800",
                    };
                    const meta = parseMetadata(item.metadata);

                    return (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{config.emoji}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">
                                  {item.title}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${config.color}`}
                                >
                                  {config.label}
                                </Badge>
                                {item.startTime && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.startTime}
                                    {item.endTime && ` - ${item.endTime}`}
                                  </span>
                                )}
                                {item.cost != null && item.cost > 0 && (
                                  <span className="text-sm text-orange-600">
                                    ¥{item.cost.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {item.type === "flight" && meta.flightNo && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {meta.airline && `${meta.airline} `}
                                  {meta.flightNo}
                                  {meta.departAirport &&
                                    meta.arriveAirport &&
                                    ` · ${meta.departAirport} → ${meta.arriveAirport}`}
                                </div>
                              )}

                              {item.type === "hotel" && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {meta.checkIn && `入住 ${meta.checkIn}`}
                                  {meta.checkOut && ` · 退房 ${meta.checkOut}`}
                                  {meta.roomType && ` · ${meta.roomType}`}
                                </div>
                              )}

                              {item.type === "restaurant" &&
                                meta.dishes?.length > 0 && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    推荐：{meta.dishes.join("、")}
                                  </div>
                                )}

                              {item.type === "shop" &&
                                meta.items?.length > 0 && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    想买：{meta.items.join("、")}
                                  </div>
                                )}

                              {item.type === "attraction" && meta.duration && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  游玩 {meta.duration}
                                  {meta.tips && ` · 💡 ${meta.tips}`}
                                </div>
                              )}

                              {item.type === "transport" && meta.mode && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {meta.mode}
                                  {meta.from &&
                                    meta.to &&
                                    ` · ${meta.from} → ${meta.to}`}
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
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expense summary */}
      {trip.expenses.length > 0 && (
        <div className="mt-8">
          <Separator className="mb-6" />
          <h2 className="text-xl font-bold mb-4">💰 费用统计</h2>
          <div className="space-y-2">
            {Object.entries(
              trip.expenses.reduce(
                (acc, e) => {
                  acc[e.category] = (acc[e.category] || 0) + e.amount;
                  return acc;
                },
                {} as Record<string, number>
              )
            ).map(([cat, total]) => {
              const config =
                EXPENSE_CATEGORY_CONFIG[cat as ExpenseCategory] ||
                EXPENSE_CATEGORY_CONFIG.other;
              return (
                <div key={cat} className="flex items-center justify-between">
                  <span>
                    {config.emoji} {config.label}
                  </span>
                  <span className="font-medium">
                    ¥{total.toLocaleString()}
                  </span>
                </div>
              );
            })}
            <Separator />
            <div className="flex items-center justify-between font-bold">
              <span>总计</span>
              <span>¥{totalExpense.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground pb-8">
        <p>
          由{" "}
          <a href="/" className="underline">
            TripFlow
          </a>{" "}
          生成
        </p>
      </div>
    </div>
  );
}
