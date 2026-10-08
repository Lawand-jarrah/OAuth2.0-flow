import { Router } from "express";
import { createAuthRoutes } from "./auth.routes";
import { createOAuthRoutes } from "./oauth.routes";

export function createRoutes(authController, oauthController) {
  const router = Router();
  router.use(createAuthRoutes(authController));
  router.use(createOAuthRoutes(oauthController));
  return router;
}
