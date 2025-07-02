const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { symbol } = req.body;

  // Replace with real stock API later if needed
  const fakeStock = {
    symbol,
    name: `${symbol} Company`,
    price: Math.random() * 1000 + 500,
    change: (Math.random() - 0.5) * 50,
    changePercent: (Math.random() - 0.5) * 5,
  };

  res.json(fakeStock);
});

module.exports = router;
