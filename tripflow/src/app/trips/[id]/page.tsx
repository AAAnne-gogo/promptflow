import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TripDetail } from "@/components/trip-detail";

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    notFound();
  }

  return <TripDetail trip={trip} />;
}
