import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/items — Create a new trip item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tripId,
      type,
      date,
      title,
      startTime,
      endTime,
      address,
      notes,
      cost,
      currency,
      metadata,
    } = body;

    if (!tripId || !type || !date || !title) {
      return NextResponse.json(
        { error: "tripId, type, date, title 为必填项" },
        { status: 400 }
      );
    }

    // Get the max sortOrder for the given date
    const maxSortItem = await prisma.tripItem.findFirst({
      where: { tripId, date: new Date(date) },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const item = await prisma.tripItem.create({
      data: {
        tripId,
        type,
        date: new Date(date),
        title,
        startTime: startTime || null,
        endTime: endTime || null,
        sortOrder: (maxSortItem?.sortOrder ?? -1) + 1,
        address: address || null,
        notes: notes || null,
        cost: cost != null ? parseFloat(String(cost)) : null,
        currency: currency || "CNY",
        metadata: metadata || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Failed to create item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
