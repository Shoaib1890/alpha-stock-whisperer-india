const express = require("express");
const Parser = require("rss-parser");
const router = express.Router();

const parser = new Parser({ timeout: 8000 });

// Multiple RSS feeds for maximum coverage
const RSS_FEEDS = [
  { url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", source: "ET Markets" },
  { url: "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms", source: "ET Stocks" },
  { url: "https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms", source: "ET Industry" },
  { url: "https://economictimes.indiatimes.com/markets/commodities/rssfeeds/1808151316.cms", source: "ET Commodities" },
  { url: "https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms", source: "ET Economy" },
  { url: "https://www.moneycontrol.com/rss/MCtopnews.xml", source: "Moneycontrol" },
  { url: "https://www.moneycontrol.com/rss/marketreports.xml", source: "MC Markets" },
  { url: "https://feeds.feedburner.com/ndtvprofit-latest", source: "NDTV Profit" },
];

const PAGE_SIZE = 20;

const stockMap = {
  "HDFCBANK": ["hdfc", "hdfc bank", "hdfc bank ltd"],
  "ICICIBANK": ["icici", "icici bank"],
  "AXISBANK": ["axis bank"],
  "SBIN": ["sbi", "state bank of india"],
  "KOTAKBANK": ["kotak", "kotak mahindra bank"],
  "BAJFINANCE": ["bajaj finance", "bajaj finserv"],
  "IDFCFIRSTB": ["idfc first"],
  "INFY": ["infosys", "infy"],
  "TCS": ["tcs", "tata consultancy"],
  "WIPRO": ["wipro"],
  "TECHM": ["tech mahindra"],
  "LTIM": ["lti mindtree", "ltimindtree"],
  "RELIANCE": ["reliance industries", "reliance", "jio", "ril"],
  "ONGC": ["ongc", "oil and natural gas"],
  "NTPC": ["ntpc"],
  "ADANIENT": ["adani enterprises", "adani group"],
  "ADANIGREEN": ["adani green energy"],
  "ADANIPORTS": ["adani ports"],
  "POWERGRID": ["power grid", "powergrid"],
  "TATAMOTORS": ["tata motors"],
  "M&M": ["mahindra", "mahindra & mahindra", "m&m"],
  "MARUTI": ["maruti suzuki", "maruti"],
  "BAJAJ_AUTO": ["bajaj auto"],
  "EICHERMOT": ["eicher motors", "royal enfield"],
  "TVSMOTOR": ["tvs motor"],
  "ITC": ["itc ltd", "itc"],
  "HINDUNILVR": ["hindustan unilever", "hul"],
  "DMART": ["dmart", "avenue supermarkets"],
  "NESTLEIND": ["nestle india"],
  "BRITANNIA": ["britannia"],
  "COLPAL": ["colgate"],
  "SUNPHARMA": ["sun pharma", "sun pharmaceutical"],
  "CIPLA": ["cipla"],
  "DRREDDY": ["dr reddy"],
  "BIOCON": ["biocon"],
  "LUPIN": ["lupin"],
  "L&T": ["larsen and toubro", "larsen & toubro", "l&t"],
  "DLF": ["dlf"],
  "INDIGO": ["indigo", "interglobe aviation"],
  "IRCTC": ["irctc"],
  "BHARTIARTL": ["airtel", "bharti airtel"],
};

// Sort keywords longest-first so longer phrases match before shorter ones
const sortedStockEntries = Object.entries(stockMap).map(([symbol, kws]) => [
  symbol,
  [...kws].sort((a, b) => b.length - a.length),
]);

function detectStocks(text = "") {
  const lower = text.toLowerCase();
  const matched = [];
  for (const [symbol, keywords] of sortedStockEntries) {
    for (const kw of keywords) {
      const pattern = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (pattern.test(lower)) {
        matched.push(symbol);
        break;
      }
    }
  }
  return [...new Set(matched)];
}

function timeAgo(dateString) {
  if (!dateString) return "Recently";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Cache to avoid hammering RSS feeds on every request
let cache = { items: [], fetchedAt: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function fetchAllNews() {
  const now = Date.now();
  if (cache.items.length > 0 && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.items;
  }

  const feedPromises = RSS_FEEDS.map(async ({ url, source }) => {
    try {
      const feed = await parser.parseURL(url);
      return feed.items.map((item) => ({ ...item, _source: source }));
    } catch (err) {
      console.warn(`⚠ Feed failed [${source}]: ${err.message}`);
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);
  const allItems = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));

  // Deduplicate by normalized title
  const seen = new Set();
  const deduped = allItems.filter((item) => {
    const key = (item.title || "").toLowerCase().replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort newest first
  deduped.sort((a, b) => {
    const ta = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const tb = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return tb - ta;
  });

  const mapped = deduped.map((item, i) => {
    const combinedText = `${item.title || ""} ${item.contentSnippet || ""}`;
    const stocks = detectStocks(combinedText);
    return {
      id: item.guid || item.link || `item-${i}`,
      title: (item.title || "").trim(),
      source: item._source || "Market News",
      time: timeAgo(item.pubDate),
      pubDate: item.pubDate || null,
      summary: (item.contentSnippet || "").trim(),
      url: item.link || null,
      sentiment: "neutral",
      confidence: 70,
      stocks,
    };
  });

  cache = { items: mapped, fetchedAt: now };
  console.log(`✅ Fetched ${mapped.length} total news items from ${RSS_FEEDS.length} feeds`);
  return mapped;
}

// GET /api/news?page=1
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const allNews = await fetchAllNews();
    const total = allNews.length;
    const start = (page - 1) * PAGE_SIZE;
    const items = allNews.slice(start, start + PAGE_SIZE);

    res.json({
      items,
      page,
      pageSize: PAGE_SIZE,
      total,
      hasMore: start + PAGE_SIZE < total,
    });
  } catch (err) {
    console.error("Error fetching news:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// GET /api/news/for-stock/:symbol  — used for portfolio news
router.get("/for-stock/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const keywords = (stockMap[symbol] || [symbol.toLowerCase()])
      .map((k) => k.toLowerCase());

    const allNews = await fetchAllNews();

    const relevant = allNews.filter((article) => {
      // Match by pre-detected stocks array
      if (article.stocks.includes(symbol)) return true;
      // Also match by keyword in title/summary as fallback
      const text = `${article.title} ${article.summary}`.toLowerCase();
      return keywords.some((kw) => {
        const pattern = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
        return pattern.test(text);
      });
    });

    res.json(relevant);
  } catch (err) {
    console.error("Error fetching stock news:", err.message);
    res.status(500).json({ error: "Failed to fetch stock news" });
  }
});

module.exports = router;
