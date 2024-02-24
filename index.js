import express from "express";
import { DevToStats } from "./devto.js";

const port = 3005;
const app = express();

app.get("/", async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const devtoStats = await new DevToStats().getDevToStats(startDate);
    res.send(devtoStats);
  } catch (error) {
    res.send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
