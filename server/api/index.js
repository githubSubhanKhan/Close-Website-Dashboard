const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 5000;


const closeRoutes = require('./routes/closeRoutes');

// Middleware to parse JSON
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use('/api/close', closeRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("✅ Backend server is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = app;