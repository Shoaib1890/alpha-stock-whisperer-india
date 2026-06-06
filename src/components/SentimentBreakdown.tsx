import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { sentimentConfig, SentimentSummaryItem } from "./SentimentIndicator";

interface SentimentBreakdownProps {
  items: SentimentSummaryItem[];
  loading?: boolean;
}

const SentimentBreakdown = ({ items, loading = false }: SentimentBreakdownProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-4/5" />
            <div className="flex items-center justify-between mt-3">
              <div className="h-4 bg-slate-100 rounded-full w-16" />
              <div className="h-3 bg-slate-100 rounded w-8" />
            </div>
            <div className="h-3 bg-slate-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, idx) => {
        const c = sentimentConfig[item.sentiment] ?? sentimentConfig.neutral;
        const Icon =
          item.sentiment === "positive"
            ? TrendingUp
            : item.sentiment === "negative"
            ? TrendingDown
            : Minus;

        return (
          <div
            key={idx}
            className={`rounded-xl border p-4 flex flex-col gap-3 ${c.bg} ${c.border}`}
          >
            {/* Headline */}
            <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-3 flex-1">
              {item.headline}
            </p>

            {/* Sentiment + confidence row */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${c.text}`}>
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                <Icon className="h-3.5 w-3.5" />
                <span className="capitalize">{item.sentiment}</span>
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-white/70 px-2 py-0.5 rounded-full border border-slate-200">
                {item.confidence}% confidence
              </span>
            </div>

            {/* Reason */}
            {item.reason && (
              <p className="text-xs text-slate-500 leading-relaxed border-t border-black/5 pt-2.5">
                {item.reason}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SentimentBreakdown;
