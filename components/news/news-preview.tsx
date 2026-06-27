import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/services/news.service";

const sentimentColors = {
  positive: "text-green-400",
  negative: "text-red-400",
  neutral: "text-muted-foreground",
};

export function NewsPreview({ articles }: { articles: NewsArticle[] }) {
  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Latest News</h3>
        <Link href="/news" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          All news <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {articles.map((a) => (
          <div key={a.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
            <p className="text-xs text-foreground line-clamp-2 leading-snug">{a.title}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={cn("text-xs font-medium capitalize", sentimentColors[a.sentiment])}>
                ● {a.sentiment}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(a.publishedAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
