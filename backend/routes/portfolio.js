const express = require('express');
const router = express.Router();

let portfolio = [];

router.get("/", (req, res) => {
  res.json(portfolio);
});

router.post("/", (req, res) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: "Symbol is required" });

  // Mock stock info (simulate fetch from API)
  const stock = {
    symbol: symbol.toUpperCase(),
    name: `${symbol.toUpperCase()} Company`,
    price: Math.random() * 1000 + 500,
    change: (Math.random() - 0.5) * 50,
    changePercent: (Math.random() - 0.5) * 5,
  };

  portfolio.push(stock);
  res.json(stock);
});

router.delete("/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  portfolio = portfolio.filter((s) => s.symbol !== symbol);
  res.json({ message: `Removed ${symbol}` });
});

module.exports = router;
