import { Router } from "express";

export function createOAuthRoutes(oauthController) {
  const router = Router();

  router.get("/authorize", oauthController.authorize);
  router.post("/authorize/decision", oauthController.decision);
  router.post("/token", oauthController.token);
  router.post("/revoke", oauthController.revoke);
  router.get("/.well-known/jwks.json", oauthController.jwks);
  return router;
}
