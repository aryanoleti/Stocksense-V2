import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function StockNews({ articles }: { articles: any[] }) {
  if (!articles.length) return null;

  return (
    <div className="card-glass p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Related News</h3>
      <div className="space-y-3">
        {articles.map((a) => (
          <a
            key={a.id}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {a.headline}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span className="font-medium">{a.source}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(a.datetime), { addSuffix: true })}</span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </div>
  );
}
