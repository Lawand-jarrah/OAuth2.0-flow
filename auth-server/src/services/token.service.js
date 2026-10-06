import { signJWT, exportJWK, importPKCS8, importSPKI } from "jose";

export function tokenService(
  privateKeyPem,
  publicKeyPem,
  iss,
  keyId,
  accessTokenTtlMs,
) {
  const privateKey = importPKCS8(privateKeyPem, "RS256");
  const publicKey = importSPKI(publicKeyPem, "RS256", { extractable: true });

  return {
    async signAccessToken({ sub, name, email, scope, aud }) {
      const claims = { sub, scope };
      if (name !== undefined) claims.name = name;
      if (email !== undefined) claims.email = email;

      const jwt = await signJWT(claims)
        .setProtectedHeader({ alg: "RS256", kid: keyId })
        .setIssuer(iss)
        .setAudience(aud)
        .setExpirationTime(Math.floor(accessTokenTtlMs / 1000))
        .sign(await privateKey);
      return jwt;
    },

    async getJWKs() {
      const jwk = await exportJWK(await publicKey);
      return { keys: [{ ...jwk, kid: keyId, alg: "RS256", use: "sig" }] };
    },
  };
}
