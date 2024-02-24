import express from "express";
import { DevToStats } from "./devto.js";

const port = 3005;
const app = express();

app.get("/", async (req, res) => {
  const devtoStats = await new DevToStats().getDevToArticles();
  res.send(devtoStats);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
