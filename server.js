const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const leadRoutes = require("./routes/leadRoutes");
const connectDatabase = require("./db/db");
const dotenv = require("dotenv");

// Config
dotenv.config({ path: "db/config.env" });

// Initialize the app
const app = express();

// Connect to MongoDB
connectDatabase();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/api/v1", leadRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(5000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// Export the app for Vercel
module.exports = app;
