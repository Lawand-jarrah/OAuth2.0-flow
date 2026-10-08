import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { createRoutes } from "./routes/index.js";
import loadUser from "./middleware/loadUser.js";

export function createApp({
  authenticationService,
  sessionCookieName,
  authController,
  oauthController,
}) {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(loadUser({ authenticationService, sessionCookieName }));
  app.use(createRoutes(authController, oauthController));
  return app;
}
