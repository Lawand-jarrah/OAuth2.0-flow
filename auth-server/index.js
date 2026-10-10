import { config } from "./src/config/config.js";
import { createDatabase } from "./src/db/pgdb.js";
import { authenticationService } from "./src/services/authentication.service.js";
import { oauthService } from "./src/services/oauth.service.js";
import { tokenService } from "./src/services/token.service.js";
import { createAuthController } from "./src/controllers/auth.controller.js";
import { createOAuthController } from "./src/controllers/oauth.controller.js";
import { createApp } from "./src/app.js";
import { refreshTokenRepository } from "./src/repositories/refreshToken.repository.js";

const db = await createDatabase(config.dbUrl);
await db.clients.create(config.clientId, [config.clientRedirectUri]);

const authService = authenticationService({
  userRepository: db.users,
  authenticationSessionRepository: db.authenticationSessions,
  sessionTtlMs: config.sessionTtlMs,
});

const tokenService = tokenService({
  privateKeyPem: config.privateKeyPem,
  publicKeyPem: config.publicKeyPem,
  iss: config.issuer,
  keyId: config.keyId,
  accessTokenTtlMs: config.accessTokenTtlMs,
});

const oauthService = oauthService({
  authorizationCodeRepository: db.authorizationCodes,
  clientRepository: db.clients,
  refreshTokenRepository: db.refreshTokens,
  tokenService: tokenService,
  authorizationCodeTtlMs: config.authorizationCodeTtlMs,
  refreshTokenTtlMs: config.refreshTokenTtlMs,
  accessTokenTtlMs: config.accessTokenTtlMs,
});

const authController = createAuthController({
  authenticationService: authService,
  sessionCookieName: config.sessionCookieName,
  sessionTtlMs: config.sessionTtlMs,
});

const oauthController = createOAuthController({
  oauthService: oauthService,
  tokenService: tokenService,
  clientId: config.clientId,
});

const app = createApp({
  authenticationService: authService,
  sessionCookieName: config.sessionCookieName,
  authController: authController,
  oauthController: oauthController,
});

app.listen(config.port, () => {
  console.log(
    `Authorization Server is running on http://localhost:${config.port}`,
  );
});
