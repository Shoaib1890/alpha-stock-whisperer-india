import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
  url?: string;
  stocks?: string[];
  sentiment?: "positive" | "negative" | "neutral";
  confidence?: number;
}

interface NewsCardProps {
  news: NewsItem;
  showStocks?: boolean;
}

const sentimentConfig = {
  positive: {
    icon: <TrendingUp className="h-3 w-3" />,
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    border: "border-l-emerald-400",
    label: "Bullish",
  },
  negative: {
    icon: <TrendingDown className="h-3 w-3" />,
    badge: "bg-red-100 text-red-700 border-red-200",
    border: "border-l-red-400",
    label: "Bearish",
  },
  neutral: {
    icon: <Minus className="h-3 w-3" />,
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    border: "border-l-slate-300",
    label: "Neutral",
  },
};

const NewsCard = ({ news, showStocks = false }: NewsCardProps) => {
  const sentiment = news.sentiment ?? "neutral";
  const config = sentimentConfig[sentiment] ?? sentimentConfig.neutral;
  const hasLink = !!news.url;

  const handleClick = () => {
    if (news.url) window.open(news.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={hasLink ? handleClick : undefined}
      role={hasLink ? "link" : undefined}
      tabIndex={hasLink ? 0 : undefined}
      onKeyDown={hasLink ? (e) => e.key === "Enter" && handleClick() : undefined}
      aria-label={hasLink ? `Read full article: ${news.title}` : undefined}
      className={`group bg-white rounded-xl border border-slate-200 border-l-4 ${config.border} p-5 transition-all duration-200 ${
        hasLink ? "cursor-pointer hover:shadow-md hover:border-slate-300" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3
          className={`font-semibold text-slate-900 text-sm leading-snug line-clamp-2 flex-1 ${
            hasLink ? "group-hover:text-blue-700" : ""
          } transition-colors`}
        >
          {news.title}
        </h3>
        {hasLink && (
          <ExternalLink
            className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 shrink-0 mt-0.5 transition-colors"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Summary */}
      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
        {news.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-600">{news.source}</span>
          <span>·</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{news.time}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {showStocks && news.stocks && news.stocks.length > 0 && (
            <>
              {news.stocks.slice(0, 3).map((stock) => (
                <Badge
                  key={stock}
                  variant="outline"
                  className="text-xs px-1.5 py-0 h-5 font-mono text-slate-600 border-slate-300"
                >
                  {stock}
                </Badge>
              ))}
              {news.stocks.length > 3 && (
                <span className="text-xs text-slate-400">+{news.stocks.length - 3}</span>
              )}
            </>
          )}
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${config.badge}`}
          >
            {config.icon}
            {config.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
