import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/items/[id] — Update an item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      type,
      date,
      title,
      startTime,
      endTime,
      sortOrder,
      address,
      notes,
      cost,
      currency,
      metadata,
    } = body;

    const item = await prisma.tripItem.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(title !== undefined && { title }),
        ...(startTime !== undefined && { startTime: startTime || null }),
        ...(endTime !== undefined && { endTime: endTime || null }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(address !== undefined && { address: address || null }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(cost !== undefined && {
          cost: cost != null ? parseFloat(String(cost)) : null,
        }),
        ...(currency !== undefined && { currency }),
        ...(metadata !== undefined && { metadata }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to update item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] — Delete an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.tripItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
