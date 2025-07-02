import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentIndicatorProps {
  sentiment: "positive" | "negative" | "neutral";
  confidence?: number;
  summary?: string; // make it optional
}

const SentimentIndicator = ({
  sentiment,
  confidence,
  summary,
}: SentimentIndicatorProps) => {
  const getSentimentConfig = () => {
    switch (sentiment) {
      case "positive":
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          color: "bg-green-100 text-green-800 border-green-200",
          label: "Positive",
        };
      case "negative":
        return {
          icon: <TrendingDown className="h-4 w-4" />,
          color: "bg-red-100 text-red-800 border-red-200",
          label: "Negative",
        };
      default:
        return {
          icon: <Minus className="h-4 w-4" />,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          label: "Neutral",
        };
    }
  };

  const config = getSentimentConfig();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Market Sentiment</span>
        <div className="flex items-center gap-2">
          <Badge className={`${config.color} flex items-center gap-1`}>
            {config.icon}
            {config.label}
          </Badge>
          {confidence !== undefined && confidence !== 70 && (
            <span className="text-xs text-gray-500">{confidence}%</span>
          )}
        </div>
      </div>
      {Array.isArray(summary) ? (
        <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
          {summary.map((point: string, idx: number) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-600 leading-relaxed">{summary}</p>
      )}
    </div>
  );
};

export default SentimentIndicator;
