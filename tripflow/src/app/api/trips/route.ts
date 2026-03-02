import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/trips — List all trips
export async function GET() {
  try {
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
    return NextResponse.json(trips);
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

// POST /api/trips — Create a new trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, destination, startDate, endDate, budget, currency, notes } =
      body;

    if (!title || !destination || !startDate || !endDate) {
      return NextResponse.json(
        { error: "标题、目的地、开始日期和结束日期为必填项" },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.create({
      data: {
        title,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: budget ? parseFloat(budget) : null,
        currency: currency || "CNY",
        notes: notes || null,
      },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error("Failed to create trip:", error);
    return NextResponse.json(
      { error: "Failed to create trip" },
      { status: 500 }
    );
  }
}
