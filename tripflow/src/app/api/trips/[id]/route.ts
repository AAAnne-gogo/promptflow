import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/trips/[id] — Get a single trip with all details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [{ date: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }],
        },
        expenses: {
          orderBy: { date: "asc" },
        },
        shares: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Failed to fetch trip:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}

// PUT /api/trips/[id] — Update a trip
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, destination, startDate, endDate, budget, currency, notes } =
      body;

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(destination !== undefined && { destination }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(budget !== undefined && {
          budget: budget ? parseFloat(budget) : null,
        }),
        ...(currency !== undefined && { currency }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Failed to update trip:", error);
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id] — Delete a trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.trip.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete trip:", error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 }
    );
  }
}
