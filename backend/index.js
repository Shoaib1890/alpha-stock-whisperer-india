const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

// ✅ Routes
const newsRoute = require('./routes/news');
const sentimentRoute = require('./routes/sentiment');
const stockRoute = require('./routes/stock');
const portfolioRoute = require("./routes/portfolio");

// ✅ Fix paths so they match frontend expectations
app.use('/api/news', newsRoute);
app.use('/api/sentiment', sentimentRoute);
app.use('/api/stock', stockRoute);
app.use("/api/portfolio", portfolioRoute);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
