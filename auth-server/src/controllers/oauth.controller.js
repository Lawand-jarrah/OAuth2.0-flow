import { renderConsentPage } from "../views/consentPage.js";

export function createOAuthController({
  oauthService,
  tokenService,
  clientId,
}) {
  return {
    async authorize(req, res) {
      const error = await oauthService.validateAuthorizationRequest(req.query);
      if (error) {
        return res.status(400).send(error.message);
      }
      if (!req.user) {
        return res.redirect(
          `/login?return_to=${encodeURIComponent(req.originalUrl)}`,
        );
      }

      res.send(
        renderConsentPage({
          clientId: req.query.client_id,
          user: req.user,
          params: req.query,
        }),
      );
    },

    async decision(req, res) {
      const {
        redirect_uri,
        scope = "",
        state,
        code_challenge,
        decision,
      } = req.body;

      const error = await oauthService.validateAuthorizationRequest(req.body);
      if (error) {
        return res.status(error.status).send(error.message);
      }
      if (!req.user) {
        return res.status(401).send("Unauthorized, user is not authenticated.");
      }

      const redirectUrl = new URL(redirect_uri);
      if (decision === "deny") {
        redirectUrl.searchParams.set("error", "access_denied");
        if (state) {
          redirectUrl.searchParams.set("state", state);
        }
        return res.redirect(redirectUrl.toString());
      }

      const code = await oauthService.issueAuthorizationCode({
        clientId: req.body.client_id,
        redirectUri: redirect_uri,
        codeChallenge: code_challenge,
        user: req.user,
        scope: scope,
      });

      redirectUrl.searchParams.set("code", code);
      if (state) {
        redirectUrl.searchParams.set("state", state);
      }
      res.redirect(redirectUrl.toString());
    },

    async token(req, res) {
      const { grant_type } = req.body;
      if (grant_type === "authorization_code") {
        const result = await tokenService.exchangeAuthorizationCode(req.body);
        return res.status(result.status).json(result.body);
      }
      if (grant_type === "refresh_token") {
        const result = await tokenService.exchangeRefreshToken(req.body);
        return res.status(result.status).json(result.body);
      }
      return res.status(400).json({
        error: "unsupported_grant_type",
        error_description: "Grant Type is not Supported.",
      });
    },

    async revoke(req, res) {
      const { client_id } = req.body;
      if (client_id !== clientId) {
        return res.status(400).json({ error: "Invalid_client" });
      }
      await tokenService.revokeToken(req.body);
      return res.status(200).end();
    },

    async jwks(req, res) {
      res.json(await tokenService.getJwks());
    },
  };
}
