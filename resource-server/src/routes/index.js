import { Router } from "express";
import { requireAuth, requireScope } from "../middleware/auth.js";
import { getProfile } from "../controllers/profile.controller.js";
import { createUserController } from "../controllers/user.controller.js";
import { userRepository } from "../repositories/user.repository.js";

export function createRoutes({ issuer, audience }) {
  const router = Router();

  const authenticate = requireAuth({ issuer, audience });
  const users = createUserController(userRepository);

  router.get(
    "/api/profile",
    authenticate,
    requireScope("read:profile"),
    getProfile,
  );
  router.get(
    "/api/users",
    authenticate,
    requireScope("read:users"),
    users.list,
  );
  router.post(
    "/api/users",
    authenticate,
    requireScope("create:users"),
    users.create,
  );

  return router;
}
