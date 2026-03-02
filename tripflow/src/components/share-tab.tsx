"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ShareTabProps {
  tripId: string;
  shares: Array<{
    id: string;
    code: string;
    createdAt: Date;
  }>;
  onRefresh: () => void;
}

export function ShareTab({ tripId, shares, onRefresh }: ShareTabProps) {
  const [loading, setLoading] = useState(false);
  const existingShare = shares[0];

  const shareUrl = existingShare
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${existingShare.code}`
    : "";

  async function handleCreateShare() {
    setLoading(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });

      if (!res.ok) throw new Error("创建失败");

      toast.success("分享链接已生成");
      onRefresh();
    } catch {
      toast.error("创建失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    toast.success("链接已复制到剪贴板");
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔗 分享旅行</CardTitle>
        </CardHeader>
        <CardContent>
          {existingShare ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                通过以下链接，任何人都可以查看你的行程（只读）：
              </p>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button onClick={handleCopy}>📋 复制</Button>
              </div>
              <div className="flex gap-2">
                <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">🔍 预览</Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🔗</div>
              <p className="text-muted-foreground mb-4">
                生成分享链接，让朋友也能看到你的旅行计划
              </p>
              <Button onClick={handleCreateShare} disabled={loading}>
                {loading ? "生成中..." : "生成分享链接"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
