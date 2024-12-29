const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Example route
app.get("/", (req, res) => {
  res.send("Hello from Vercel!");
});

// Listen on the given port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
