const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(express.json());

// Modified in-memory DB with a user that has no credits
const users = {
  "test-api-key-123": { email: "user@example.com", credits: 0 },
};

// Auth Middleware
function authenticate(req, res, next) {
  const apiKey = req.header("x-api-key");
  if (!apiKey || !users[apiKey]) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = users[apiKey];
  req.apiKey = apiKey;
  next();
}

// Scrape Endpoint
app.get("/scrape", authenticate, (req, res) => {
  const user = req.user;

  if (user.credits < 1) {
    return res.status(402).json({ error: "Out of credits" });
  }

  // This code should never be reached in this test
  const data = {
    result: "Scraped content goes here"
  };

  user.credits -= 1;
  res.json({ ...data, remainingCredits: user.credits });
});

const port = 8081;
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  console.log(`To test: curl -H "x-api-key: test-api-key-123" http://localhost:${port}/scrape`);
  console.log(`Expected response: {"error":"Out of credits"}`);
});
