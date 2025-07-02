import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Star, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NewsCard from "@/components/NewsCard";
import PortfolioStock from "@/components/PortfolioStock";
import SentimentIndicator from "@/components/SentimentIndicator";
import { stockMap } from "@/lib/stockMap";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
  stocks?: string[];
  sentiment?: "positive" | "negative" | "neutral";
  confidence?: number;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

type SentimentSummaryItem = {
  headline: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
};

interface SentimentAnalysis {
  overall: "positive" | "negative" | "neutral";
  confidence: number;
  summary: SentimentSummaryItem[];
}

const Index = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [portfolio, setPortfolio] = useState<Stock[]>([]);
  const [newStock, setNewStock] = useState("");
  const [loading, setLoading] = useState(false);
  // const [sentimentAnalysis, setSentimentAnalysis] = useState<any>(null);
  const [sentimentAnalysis, setSentimentAnalysis] =
    useState<SentimentAnalysis | null>(null);

  const [portfolioNews, setPortfolioNews] = useState<NewsItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const newsRes = await fetch("http://localhost:5000/api/news");
      const newsData = await newsRes.json();

      const portfolioRes = await fetch("http://localhost:5000/api/portfolio");
      const portfolioData = await portfolioRes.json();

      setNews(newsData);
      setPortfolio(portfolioData);

      await analyzeSentiment(newsData, portfolioData);

      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (portfolio.length > 0 || news.length > 0) {
      analyzeSentiment(news, portfolio);
    } else {
      // Clear data if portfolio is empty
      setSentimentAnalysis({
        overall: "neutral",
        confidence: 70,
        summary: [],
      });
      setPortfolioNews([]);
    }
  }, [portfolio, news]);

  const getRelevantNews = (
    newsData: NewsItem[],
    portfolioSymbols: string[]
  ) => {
    return newsData.filter((n) => {
      const matchesStocks =
        n.stocks?.some((stock) =>
          portfolioSymbols.includes(stock.toUpperCase())
        ) ?? false;

      const matchesTitle = portfolioSymbols.some((symbol) =>
        n.title.toLowerCase().includes(symbol.toLowerCase())
      );

      return matchesStocks || matchesTitle;
    });
  };

  const getPortfolioNews = (portfolio: Stock[], allNews: NewsItem[]) => {
    const aliases = portfolio.flatMap(
      (stock) => stockMap[stock.symbol] || [stock.symbol]
    );

    return allNews.filter((article) =>
      aliases.some((alias) =>
        article.title.toLowerCase().includes(alias.toLowerCase())
      )
    );
  };

  const analyzeSentiment = async (
    newsData = news,
    portfolioData = portfolio
  ) => {
    const portfolioSymbols = portfolioData.map((s) => s.symbol.toUpperCase());
    console.log("📦 Portfolio Symbols for sentiment:", portfolioSymbols);

    const relevantNews = getRelevantNews(newsData, portfolioSymbols);
    console.log("📰 Relevant news for sentiment:", relevantNews);

    const headlines = relevantNews.map((n) => n.title);
    console.log("🧠 Headlines to send for sentiment:", headlines);

    if (headlines.length === 0) {
      console.warn("⚠ No relevant headlines found for sentiment analysis.");
      setSentimentAnalysis({
        overall: "neutral",
        confidence: 70,
        summary: [],
      });
      setPortfolioNews(getPortfolioNews(portfolioData, newsData));
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headlines }),
      });

      const result = await response.json();
      const relevantSummary = Array.isArray(result.sentiment)
        ? result.sentiment
        : [];

      const dominantSentiment = relevantSummary.reduce((acc, item) => {
        const score =
          item.sentiment === "positive"
            ? 1
            : item.sentiment === "negative"
            ? -1
            : 0;
        return acc + score;
      }, 0);

      const overall =
        dominantSentiment > 0
          ? "positive"
          : dominantSentiment < 0
          ? "negative"
          : "neutral";

      const avgConfidence = relevantSummary.length
        ? Math.round(
            relevantSummary.reduce(
              (sum, item) => sum + (item.confidence || 70),
              0
            ) / relevantSummary.length
          )
        : 70;

      setSentimentAnalysis({
        overall,
        confidence: avgConfidence,
        summary: relevantSummary,
      });
    } catch (error) {
      console.error("❌ Sentiment analysis failed:", error);
      setSentimentAnalysis(null);
    }

    setPortfolioNews(getPortfolioNews(portfolioData, newsData));
  };

  const addStock = async () => {
    if (newStock.trim()) {
      try {
        const response = await fetch("http://localhost:5000/api/stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: newStock.trim().toUpperCase() }),
        });

        if (!response.ok) throw new Error("Failed to fetch stock data");

        const stockData: Stock = await response.json();

        const updatedPortfolio = [...portfolio, stockData];
        setPortfolio(updatedPortfolio);
        setNewStock("");

        toast({
          title: "Stock Added",
          description: `${stockData.symbol} has been added to your portfolio`,
        });

        await fetch("http://localhost:5000/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stockData),
        });

        // await analyzeSentiment(news, updatedPortfolio);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not fetch stock data. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const removeStock = async (symbol: string) => {
    const updatedPortfolio = portfolio.filter(
      (stock) => stock.symbol !== symbol
    );
    setPortfolio(updatedPortfolio);

    await fetch(`http://localhost:5000/api/portfolio/${symbol}`, {
      method: "DELETE",
    });

    toast({
      title: "Stock Removed",
      description: `${symbol} has been removed from your portfolio`,
    });

    // await analyzeSentiment(news, updatedPortfolio);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Smart Portfolio Insights
          </h1>
          <p className="text-gray-600 text-lg">
            AI-powered stock market news analysis for your portfolio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Portfolio Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Stocks</span>
                  <span className="font-semibold">{portfolio.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Portfolio Value</span>
                  <span className="font-semibold text-green-600">
                    ₹
                    {portfolio
                      .reduce((sum, stock) => sum + stock.price, 0)
                      .toLocaleString()}
                  </span>
                </div>
                {sentimentAnalysis && (
                  <div className="space-y-2">
                    <SentimentIndicator
                      sentiment={sentimentAnalysis.overall}
                      confidence={sentimentAnalysis.confidence}
                    />
                    {Array.isArray(sentimentAnalysis.summary) ? (
                      <div className="space-y-1 text-sm text-gray-700">
                        {sentimentAnalysis.summary.map((item, idx) => (
                          <div key={idx} className="border-b pb-1">
                            <strong>{item.headline}</strong>
                            <br />
                            Sentiment:{" "}
                            <span className="capitalize">{item.sentiment}</span>
                            , Confidence: {item.confidence}%
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        {sentimentAnalysis.summary}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-500" />
                Add Stock to Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter stock symbol (e.g., HDFCBANK)"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addStock()}
                  className="flex-1"
                />
                <Button
                  onClick={addStock}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all-news" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-news">All Market News</TabsTrigger>
            <TabsTrigger value="portfolio-news">Portfolio News</TabsTrigger>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="all-news" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Latest Market News</h2>
              <Badge variant="outline" className="text-sm">
                {news.length} articles
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))
                : news.map((item) => <NewsCard key={item.id} news={item} />)}
            </div>
          </TabsContent>

          <TabsContent value="portfolio-news" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                Portfolio-Relevant News
              </h2>
              <Badge variant="outline" className="text-sm">
                {portfolioNews.length} relevant articles
              </Badge>
            </div>
            {portfolioNews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No portfolio-specific news found
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Add stocks to your portfolio to see relevant news
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolioNews.map((item) => (
                  <NewsCard key={item.id} news={item} showStocks />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">My Portfolio</h2>
              <Badge variant="outline" className="text-sm">
                {portfolio.length} stocks
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.map((stock) => (
                <PortfolioStock
                  key={stock.symbol}
                  stock={stock}
                  onRemove={() => removeStock(stock.symbol)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
