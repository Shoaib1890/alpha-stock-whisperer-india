
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
  stocks?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  confidence?: number;
}

interface NewsCardProps {
  news: NewsItem;
  showStocks?: boolean;
}

const NewsCard = ({ news, showStocks = false }: NewsCardProps) => {
  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'negative':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <Card className={`transition-all duration-200 cursor-pointer ${getSentimentColor(news.sentiment)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
            {news.title}
          </h3>
          {news.sentiment && (
            <div className="flex items-center gap-1">
              {getSentimentIcon(news.sentiment)}
              {news.confidence && (
                <span className="text-xs text-gray-600">{news.confidence}%</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium">{news.source}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{news.time}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
          {news.summary}
        </p>
        {showStocks && news.stocks && news.stocks.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {news.stocks.map((stock) => (
              <Badge key={stock} variant="secondary" className="text-xs">
                {stock}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsCard;
