import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/expenses — Create a new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, category, amount, currency, description, paidBy, date, itemId } = body;

    if (!tripId || !category || amount == null || !date) {
      return NextResponse.json(
        { error: "tripId, category, amount, date 为必填项" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        tripId,
        category,
        amount: parseFloat(String(amount)),
        currency: currency || "CNY",
        description: description || null,
        paidBy: paidBy || null,
        date: new Date(date),
        itemId: itemId || null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Failed to create expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
