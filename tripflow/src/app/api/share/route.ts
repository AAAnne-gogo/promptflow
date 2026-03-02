import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/share — Create a share link for a trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId } = body;

    if (!tripId) {
      return NextResponse.json(
        { error: "tripId 为必填项" },
        { status: 400 }
      );
    }

    // Check if share already exists
    const existing = await prisma.share.findFirst({
      where: { tripId },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const share = await prisma.share.create({
      data: { tripId },
    });

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error("Failed to create share:", error);
    return NextResponse.json(
      { error: "Failed to create share" },
      { status: 500 }
    );
  }
}

// GET /api/share?code=xxx — Get shared trip by code
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "code 参数为必填" },
        { status: 400 }
      );
    }

    const share = await prisma.share.findUnique({
      where: { code },
      include: {
        trip: {
          include: {
            items: {
              orderBy: [
                { date: "asc" },
                { sortOrder: "asc" },
                { startTime: "asc" },
              ],
            },
            expenses: {
              orderBy: { date: "asc" },
            },
          },
        },
      },
    });

    if (!share) {
      return NextResponse.json(
        { error: "分享链接不存在或已过期" },
        { status: 404 }
      );
    }

    // Check expiration
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "分享链接已过期" },
        { status: 410 }
      );
    }

    return NextResponse.json(share);
  } catch (error) {
    console.error("Failed to fetch share:", error);
    return NextResponse.json(
      { error: "Failed to fetch share" },
      { status: 500 }
    );
  }
}
