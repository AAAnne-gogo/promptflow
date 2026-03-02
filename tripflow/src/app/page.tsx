import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { TripCard } from "@/components/trip-card";

export default async function HomePage() {
  const trips = await prisma.trip.findMany({
    orderBy: { startDate: "desc" },
    include: {
      _count: {
        select: { items: true, expenses: true },
      },
      expenses: {
        select: { amount: true },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">我的旅行</h1>
          <p className="text-muted-foreground mt-1">
            规划你的每一次精彩旅程
          </p>
        </div>
        <Link href="/trips/new">
          <Button size="lg">
            <span className="mr-2">✈️</span>
            创建旅行
          </Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🌍</div>
          <h2 className="text-2xl font-semibold mb-2">还没有旅行计划</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            开始规划你的第一次旅行吧！添加航班、酒店、美食、购物，记录每一笔花费。
          </p>
          <Link href="/trips/new">
            <Button size="lg">
              <span className="mr-2">✈️</span>
              创建第一个旅行
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip: typeof trips[number]) => (
            <TripCard
              key={trip.id}
              trip={trip}
              itemCount={trip._count.items}
              totalExpense={trip.expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
