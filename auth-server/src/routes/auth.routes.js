import { Router } from "express";

export function createAuthRoutes(authController) {
  const router = Router();

  router.get("/login", authController.showLoginForm);
  router.post("/login", authController.login);
  router.get("/logout", authController.logout);
  return router;
}
