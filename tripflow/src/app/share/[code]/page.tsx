import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ShareView } from "@/components/share-view";

export default async function SharePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

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
    notFound();
  }

  // Check expiration
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-semibold mb-2">链接已过期</h2>
        <p className="text-muted-foreground">这个分享链接已经过期了</p>
      </div>
    );
  }

  return <ShareView trip={share.trip} />;
}
