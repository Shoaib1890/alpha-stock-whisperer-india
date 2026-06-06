import { TrendingUp, TrendingDown, Minus, Brain } from "lucide-react";

export interface SentimentSummaryItem {
  headline: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  reason: string;
}

interface SentimentIndicatorProps {
  sentiment: "positive" | "negative" | "neutral";
  confidence?: number;
}

export const sentimentConfig = {
  positive: {
    icon: <TrendingUp className="h-4 w-4" />,
    iconSm: <TrendingUp className="h-3 w-3" />,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    bar: "bg-emerald-400",
    dot: "bg-emerald-500",
    label: "Bullish",
  },
  negative: {
    icon: <TrendingDown className="h-4 w-4" />,
    iconSm: <TrendingDown className="h-3 w-3" />,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    bar: "bg-red-400",
    dot: "bg-red-500",
    label: "Bearish",
  },
  neutral: {
    icon: <Minus className="h-4 w-4" />,
    iconSm: <Minus className="h-3 w-3" />,
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
    bar: "bg-slate-300",
    dot: "bg-slate-400",
    label: "Neutral",
  },
};

/** Compact pill + confidence bar — lives inside the portfolio summary card */
const SentimentIndicator = ({
  sentiment,
  confidence = 70,
}: SentimentIndicatorProps) => {
  const c = sentimentConfig[sentiment] ?? sentimentConfig.neutral;

  return (
    <div className="space-y-2.5">
      <div className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${c.bg} ${c.border}`}>
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-500">AI Sentiment</span>
        </div>
        <div className={`flex items-center gap-1.5 font-semibold text-sm ${c.text}`}>
          {c.icon}
          <span>{c.label}</span>
          <span className="text-xs font-normal opacity-70">· {confidence}%</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Confidence</span>
          <span>{confidence}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${c.bar}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SentimentIndicator;
