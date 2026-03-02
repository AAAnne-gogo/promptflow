import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4">🗺️</div>
      <h2 className="text-2xl font-semibold mb-2">页面未找到</h2>
      <p className="text-muted-foreground mb-6">
        你访问的页面不存在，可能已被删除或链接有误。
      </p>
      <Link href="/">
        <Button>返回首页</Button>
      </Link>
    </div>
  );
}
