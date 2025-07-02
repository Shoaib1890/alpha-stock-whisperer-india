const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res) => {
  console.log("🚀 [API] /api/sentiment endpoint called");

  const { headlines } = req.body;
  console.log("📰 Headlines being sent for sentiment:", headlines);

  if (!headlines || !Array.isArray(headlines)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  console.log("🔑 API key present?", !!process.env.OPENROUTER_API_KEY);

  try {
    const results = await Promise.all(
      headlines.map(async (headline) => {
        const prompt = `Analyze the following stock market news headline: "${headline}". 
Determine its likely sentiment impact on investors. 

Respond ONLY in this exact format (no extra text):
Sentiment: Positive | Negative | Neutral
Confidence: <number>% (between 70% and 100%)`;


        try {
          const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              model: "openrouter/auto",
              messages: [{ role: "user", content: prompt }],
              max_tokens: 100 
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173", 
                "X-Title": "Stock Whisperer",
              },
            }
          );

          console.log("🌐 Full API response:", JSON.stringify(response.data, null, 2));

          const aiText = response.data.choices[0].message.content;
          console.log("🧠 Headline:", headline);
          console.log("🧠 AI Response:", aiText);

          const sentimentMatch = aiText.match(
            /sentiment[:\-]?\s*(positive|negative|neutral)/i
          );
          const confidenceMatch = aiText.match(/confidence[:\-]?\s*(\d{2,3})/i);

          const sentiment = sentimentMatch
            ? sentimentMatch[1].toLowerCase()
            : "neutral";
          const confidence = confidenceMatch
            ? parseInt(confidenceMatch[1])
            : Math.floor(Math.random() * 21) + 70;

          console.log("🔍 Parsed Sentiment:", sentiment);
          console.log("📊 Parsed Confidence:", confidence);

          return {
            headline,
            sentiment,
            confidence,
          };
        } catch (apiErr) {
          console.error(`❌ API failed for headline: ${headline}`);
          console.error(apiErr.response?.data || apiErr.message);
          return {
            headline,
            sentiment: "neutral",
            confidence: 70,
          };
        }
      })
    );

    res.json({ sentiment: results });
  } catch (error) {
    console.error("AI sentiment API failed:", error);
    res.status(500).json({ error: "Sentiment analysis failed" });
  }
});

module.exports = router;
