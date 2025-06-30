
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Minus, Plus, Search, Star, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NewsCard from "@/components/NewsCard";
import PortfolioStock from "@/components/PortfolioStock";
import SentimentIndicator from "@/components/SentimentIndicator";

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

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const Index = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [portfolio, setPortfolio] = useState<Stock[]>([]);
  const [newStock, setNewStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<any>(null);
  const { toast } = useToast();

  // Mock news data - In production, this would come from news APIs
  const mockNews: NewsItem[] = [
    {
      id: "1",
      title: "HDFC Bank reports strong Q3 results, NII grows 15% YoY",
      source: "Economic Times",
      time: "2 hours ago",
      summary: "HDFC Bank's net interest income grew 15% year-on-year driven by strong loan growth",
      stocks: ["HDFCBANK"],
      sentiment: "positive",
      confidence: 85
    },
    {
      id: "2",
      title: "Infosys wins major digital transformation deal worth $2B",
      source: "Moneycontrol",
      time: "4 hours ago",
      summary: "The deal spans 5 years and will boost Infosys's revenue significantly",
      stocks: ["INFY"],
      sentiment: "positive",
      confidence: 90
    },
    {
      id: "3",
      title: "RBI maintains repo rate at 6.5%, signals cautious stance",
      source: "Business Standard",
      time: "6 hours ago",
      summary: "Central bank keeps rates unchanged citing inflation concerns",
      sentiment: "neutral",
      confidence: 70
    },
    {
      id: "4",
      title: "Reliance Industries faces regulatory challenges in telecom sector",
      source: "Financial Express",
      time: "8 hours ago",
      summary: "New regulations may impact Jio's expansion plans",
      stocks: ["RELIANCE"],
      sentiment: "negative",
      confidence: 75
    }
  ];

  // Mock portfolio data
  const mockStocks: Stock[] = [
    { symbol: "HDFCBANK", name: "HDFC Bank", price: 1687.50, change: 25.30, changePercent: 1.52 },
    { symbol: "INFY", name: "Infosys", price: 1456.80, change: -12.45, changePercent: -0.85 },
    { symbol: "RELIANCE", name: "Reliance Industries", price: 2890.25, change: 15.60, changePercent: 0.54 },
    { symbol: "TCS", name: "Tata Consultancy Services", price: 3567.90, change: -5.20, changePercent: -0.15 }
  ];

  useEffect(() => {
    // Simulate loading news
    setLoading(true);
    setTimeout(() => {
      setNews(mockNews);
      setPortfolio(mockStocks);
      setLoading(false);
      analyzeSentiment();
    }, 1000);
  }, []);

  const addStock = () => {
    if (newStock.trim()) {
      // In production, this would validate and fetch real stock data
      const newStockData: Stock = {
        symbol: newStock.toUpperCase(),
        name: `${newStock.toUpperCase()} Company`,
        price: Math.random() * 1000 + 500,
        change: (Math.random() - 0.5) * 50,
        changePercent: (Math.random() - 0.5) * 5
      };
      setPortfolio([...portfolio, newStockData]);
      setNewStock("");
      toast({
        title: "Stock Added",
        description: `${newStock.toUpperCase()} has been added to your portfolio`,
      });
    }
  };

  const removeStock = (symbol: string) => {
    setPortfolio(portfolio.filter(stock => stock.symbol !== symbol));
    toast({
      title: "Stock Removed",
      description: `${symbol} has been removed from your portfolio`,
    });
  };

  const analyzeSentiment = () => {
    // Mock AI analysis - In production, this would call OpenAI API
    const portfolioSymbols = mockStocks.map(s => s.symbol);
    const relevantNews = mockNews.filter(n => 
      n.stocks && n.stocks.some(stock => portfolioSymbols.includes(stock))
    );
    
    const positiveCount = relevantNews.filter(n => n.sentiment === 'positive').length;
    const negativeCount = relevantNews.filter(n => n.sentiment === 'negative').length;
    
    let overallSentiment = 'neutral';
    if (positiveCount > negativeCount) overallSentiment = 'positive';
    else if (negativeCount > positiveCount) overallSentiment = 'negative';
    
    setSentimentAnalysis({
      overall: overallSentiment,
      confidence: Math.round((Math.max(positiveCount, negativeCount) / relevantNews.length) * 100),
      summary: `Based on ${relevantNews.length} relevant news items, your portfolio shows ${overallSentiment} sentiment`,
      positiveCount,
      negativeCount,
      neutralCount: relevantNews.length - positiveCount - negativeCount
    });
  };

  const filteredNews = news.filter(item => 
    item.stocks && item.stocks.some(stock => 
      portfolio.some(p => p.symbol === stock)
    )
  );

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
          {/* Portfolio Summary */}
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
                    ₹{(portfolio.reduce((sum, stock) => sum + stock.price, 0)).toLocaleString()}
                  </span>
                </div>
                {sentimentAnalysis && (
                  <SentimentIndicator 
                    sentiment={sentimentAnalysis.overall}
                    confidence={sentimentAnalysis.confidence}
                    summary={sentimentAnalysis.summary}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add Stock */}
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
                  onKeyPress={(e) => e.key === 'Enter' && addStock()}
                  className="flex-1"
                />
                <Button onClick={addStock} className="bg-blue-600 hover:bg-blue-700">
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
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                news.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="portfolio-news" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Portfolio-Relevant News</h2>
              <Badge variant="outline" className="text-sm">
                {filteredNews.length} relevant articles
              </Badge>
            </div>
            {filteredNews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No portfolio-specific news found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Add stocks to your portfolio to see relevant news
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNews.map((item) => (
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
