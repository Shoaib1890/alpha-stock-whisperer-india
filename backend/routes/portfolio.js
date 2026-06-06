const express = require('express');
const router = express.Router();

let portfolio = [];

router.get("/", (req, res) => {
  res.json(portfolio);
});

// Accept a full stock object (symbol, name, price, change, changePercent)
router.post("/", (req, res) => {
  const stock = req.body;
  if (!stock || !stock.symbol) return res.status(400).json({ error: "Stock data is required" });

  // Prevent duplicates
  const exists = portfolio.find(s => s.symbol === stock.symbol.toUpperCase());
  if (exists) return res.status(409).json({ error: "Stock already in portfolio" });

  const entry = {
    symbol: stock.symbol.toUpperCase(),
    name: stock.name || `${stock.symbol.toUpperCase()} Company`,
    price: stock.price || 0,
    change: stock.change || 0,
    changePercent: stock.changePercent || 0,
  };

  portfolio.push(entry);
  res.json(entry);
});

router.delete("/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  portfolio = portfolio.filter((s) => s.symbol !== symbol);
  res.json({ message: `Removed ${symbol}` });
});

module.exports = router;
