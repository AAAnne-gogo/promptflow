"use client";

import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TripData {
  id: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  coverImage: string | null;
  budget: number | null;
  currency: string;
  notes: string | null;
}

interface TripCardProps {
  trip: TripData;
  itemCount: number;
  totalExpense: number;
}

export function TripCard({ trip, itemCount, totalExpense }: TripCardProps) {
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const now = new Date();

  const isUpcoming = startDate > now;
  const isOngoing = startDate <= now && endDate >= now;
  const isPast = endDate < now;

  const days =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg leading-tight">
                {trip.title}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                📍 {trip.destination}
              </p>
            </div>
            {isUpcoming && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                即将出发
              </Badge>
            )}
            {isOngoing && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                进行中
              </Badge>
            )}
            {isPast && (
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-600"
              >
                已结束
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>📅</span>
            <span>
              {format(startDate, "M月d日", { locale: zhCN })} -{" "}
              {format(endDate, "M月d日", { locale: zhCN })}
            </span>
            <span className="text-xs">({days}天)</span>
          </div>
        </CardContent>
        <CardFooter className="pt-0 text-sm text-muted-foreground gap-4">
          <span>📋 {itemCount} 个行程</span>
          {totalExpense > 0 && (
            <span>
              💰 ¥{totalExpense.toLocaleString()}
            </span>
          )}
          {trip.budget && (
            <span className="text-xs">
              / 预算 ¥{trip.budget.toLocaleString()}
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
