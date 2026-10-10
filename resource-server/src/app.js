import express from "express";
import { createRoutes } from "./routes/index.js";

export function createApp({ issuer, audience }) {
  const app = express();
  app.use(express.json());
  app.use(createRoutes({ issuer, audience }));
  return app;
}
