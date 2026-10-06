import { generateOpaqueCode, sha256Base64url } from "./cryptoHelper.service.js";

export function oauthService({
  authorizationCodeRepository,
  clientRepository,
  refreshTokenRepository,
  tokenService,
  authorizationCodeTtlMs,
  refreshTokenTtlMs,
  accessTokenTtlMs,
}) {
  async function issueRefreshToken({ userSub, clientId, scope }) {
    const token = generateOpaqueCode();
    await refreshTokenRepository.create({
      token,
      user_sub: userSub,
      client_id: clientId,
      scope,
      expires_at: Date.now() + refreshTokenTtlMs,
    });
    return token;
  }

  function tokenResponse(accessToken, refreshToken) {
    return {
      status: 200,
      body: {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: Math.floor(authorizationCodeTtlMs / 1000),
        refresh_token: refreshToken,
      },
    };
  }

  function grantError(error, description) {
    return { status: 400, body: { error, error_description: description } };
  }

  return {
    async validateAuthorizationRequest({
      response_type,
      client_id,
      redirect_uri,
      code_challenge,
      code_challenge_method,
    }) {
      const client = await clientRepository.findById(client_id);
      if (!client) {
        return grantError(
          "Invalid client_id",
          "The provided client_id is not valid",
        );
      }
      if (!client.redirect_uris.includes(redirect_uri)) {
        return grantError(
          "Invalid redirect_uri",
          "The provided redirect_uri is not valid",
        );
      }
      if (response_type !== "code") {
        return grantError(
          "Unsupported response_type",
          "The provided response_type is not supported",
        );
      }
      if (!code_challenge || code_challenge_method !== "S256") {
        return grantError(
          "invalid_request",
          "Invalid code_challenge or code_challenge_method",
        );
      }

      return null;
    },

    async issueAuthorizationCode({
      clientId,
      redirectUri,
      codeChallenge,
      user,
      scope,
    }) {
      const code = generateOpaqueCode();
      await authorizationCodeRepository.create({
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
        code_challenge: codeChallenge,
        user_sub: user.sub,
        user_name: user.name,
        user_email: user.email,
        scope: scope,
        expires_at: Date.now() + authorizationCodeTtlMs,
      });
      return code;
    },

    async exchangeAuthorizationCode({
      code,
      redirectUri,
      clientId,
      codeVerifier,
    }) {
      const record = await authorizationCodeRepository.findByCode(code);
      if (!record) {
        return grantError("invalid_grant", "Unknown Authorization Code");
      }
      if (record.expires_at < Date.now()) {
        return grantError("invalid_grant", "Authorization code has expired");
      }
      if (
        record.client_id !== clientId ||
        record.redirect_uri !== redirectUri
      ) {
        return grantError(
          "invalid_grant",
          "Client ID or redirect URI mismatch",
        );
      }
      if (sha256Base64url(codeVerifier) !== record.code_challenge) {
        return grantError("invalid_grant", "PKCE verification failed");
      }

      await authorizationCodeRepository.deleteByCode(code);

      const accessToken = await tokenService.signAccessToken({
        sub: record.user_sub,
        name: record.user_name,
        email: record.user_email,
        scope: record.scope,
        aud: clientId,
      });

      const refreshToken = await issueRefreshToken({
        userSub: record.user_sub,
        clientId: clientId,
        scope: record.scope,
      });

      return tokenResponse({ accessToken, refreshToken });
    },

    async exchangeRefreshToken({ refreshToken, clientId }) {
      const record = await refreshTokenRepository.findByToken(refreshToken);
      if (!record) {
        return grantError("invalid_grant", "Unknown Refresh Token");
      }
      if (record.expires_at < Date.now()) {
        await refreshTokenRepository.deleteByToken(refreshToken);
        return grantError("invalid_grant", "Refresh Token has Expired");
      }
      if (record.client_id !== clientId) {
        return grantError("invalid_grant", "Client ID mismatch");
      }

      await refreshTokenRepository.deleteByToken(refreshToken);

      const user = await userRepository.findBySub(record.user_sub);
      const accessToken = await tokenService.signAccessToken({
        sub: record.user_sub,
        name: user.name,
        email: user.email,
        scope: record.scope,
        aud: clientId,
      });

      const newRefreshToken = await issueRefreshToken({
        userSub: record.user_sub,
        clientId: clientId,
        scope: record.scope,
      });

      return tokenResponse(accessToken, newRefreshToken);
    },

    async revokeToken({ token, token_type_hint }) {
      if (!token) {
        return;
      }
      if (!token_type_hint || token_type_hint === "refresh_token") {
        await refreshTokenRepository.deleteByToken(token);
      }
    },
  };
}
