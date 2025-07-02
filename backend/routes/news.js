const express = require("express");
const Parser = require("rss-parser");
const router = express.Router();

const parser = new Parser();
const RSS_URL = "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms";

// 🧠 Keyword-to-stock-symbol mapping
const stockMap = {
  // 🏦 Banking & Finance
  "HDFCBANK": ["hdfc", "hdfc bank", "hdfc bank ltd"],
  "ICICIBANK": ["icici", "icici bank", "icici bank ltd"],
  "AXISBANK": ["axis", "axis bank", "axis bank ltd"],
  "SBIN": ["sbi", "state bank of india", "sbin"],
  "KOTAKBANK": ["kotak", "kotak mahindra", "kotak mahindra bank"],
  "BAJFINANCE": ["bajaj finance", "bajaj finserv"],
  "IDFCFIRSTB": ["idfc", "idfc first", "idfc first bank"],

  // 💻 IT Services
  "INFY": ["infy", "infosys", "infosys ltd", "infosys technologies"],
  "TCS": ["tcs", "tata consultancy", "tata consultancy services"],
  "WIPRO": ["wipro"],
  "TECHM": ["tech mahindra", "techm"],
  "LTIM": ["lti mindtree", "ltimindtree", "l&t infotech"],

  // 🛢️ Oil, Gas & Infra
  "RELIANCE": ["reliance", "reliance industries", "jio", "ril"],
  "ONGC": ["ongc", "oil and natural gas", "ongc ltd"],
  "NTPC": ["ntpc"],
  "ADANIENT": ["adani enterprises", "adani", "adani group", "adani ent"],
  "ADANIGREEN": ["adani green", "adani green energy"],
  "ADANIPORTS": ["adani ports", "adani logistics", "adani ports and sezc"],
  "POWERGRID": ["power grid", "powergrid"],

  // 🚗 Auto
  "TATAMOTORS": ["tata motors", "tata motor"],
  "M&M": ["mahindra", "mahindra & mahindra", "m&m"],
  "MARUTI": ["maruti", "maruti suzuki", "maruti udyog"],
  "BAJAJ_AUTO": ["bajaj auto"],
  "EICHERMOT": ["eicher", "eicher motors", "royal enfield"],
  "TVSMOTOR": ["tvs", "tvs motor"],

  // 🧴 FMCG / Retail
  "ITC": ["itc", "itc ltd"],
  "HINDUNILVR": ["hindustan unilever", "hul", "hll"],
  "DMART": ["dmart", "avenue supermarkets"],
  "NESTLEIND": ["nestle", "nestle india"],
  "BRITANNIA": ["britannia"],
  "COLPAL": ["colgate", "colgate palmolive"],

  // 💊 Pharma
  "SUNPHARMA": ["sun pharma", "sun pharmaceutical"],
  "CIPLA": ["cipla"],
  "DRREDDY": ["dr reddy", "dr reddy's", "dr. reddy"],
  "BIOCON": ["biocon"],
  "LUPIN": ["lupin"],

  // 🏗️ Infra & Construction
  "L&T": ["l&t", "larsen and toubro", "larsen & toubro"],
  "DLF": ["dlf", "dlf ltd"],

  // ✈️ Travel & Others
  "INDIGO": ["indigo", "interglobe aviation"],
  "IRCTC": ["irctc", "indian railways catering", "railway ticket"],

  // ☁️ Telecom
  "BHARTIARTL": ["airtel", "bharti", "bharti airtel"]
};


function detectStocks(text = "") {
  const lowerText = text.toLowerCase();
  const matchedStocks = [];

  for (const [symbol, keywords] of Object.entries(stockMap)) {
    for (const keyword of keywords) {
      const pattern = new RegExp(`\\b${keyword.toLowerCase()}\\b`, "i"); // whole word match
      if (pattern.test(lowerText)) {
        matchedStocks.push(symbol);
        break; // avoid duplicate matches
      }
    }
  }

  return [...new Set(matchedStocks)];
}



// Optional helper: human-readable time (e.g., "2 hours ago")
function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours > 1 ? "s" : ""} ago`;
}

router.get("/", async (req, res) => {
  try {
    const feed = await parser.parseURL(RSS_URL);
    const news = feed.items.slice(0, 10).map((item, i) => {
      const combinedText = `${item.title} ${item.contentSnippet}`;
      const stocks = detectStocks(combinedText);
      console.log("🔎 [News]", item.title, "→", stocks);


      return {
        id: item.guid || `${i}`,
        title: item.title || "",
        source: "ET Markets",
        time: timeAgo(item.pubDate), // ⏱ human-readable
        summary: item.contentSnippet || "",
        sentiment: "neutral", // mock for now
        confidence: 70,
        stocks: stocks.length > 0 ? stocks : [], // ✅ always return array
      };
    });

    res.json(news);
  } catch (err) {
    console.error("Error fetching RSS:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

module.exports = router;
