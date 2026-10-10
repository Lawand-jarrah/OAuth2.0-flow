import { jwtVerify, createRemoteJWKSet } from "jose";

export function requireAuth({ issuer, audience }) {
  const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));

  return async function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or Invalid Token", message: "Authorization header is missing or malformed." });
    }
    const token = authHeader.slice("Bearer ".length);
    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer,
        audience,
      });
      req.user = payload;
      next();
    } catch (err) {
      return res
        .status(401)
        .json({ error: "Invalid Token", message: err.message });
    }
  };
}

export function requireScope(requiredScope) {
  return function (req, res, next) {
    const tokenScope = String(req.user.scope || "")
      .split(" ")
      .filter(Boolean);
    if (!tokenScope.includes(requiredScope)) {
      return res.status(403).json({ error: "Insufficient scope" });
    }
    next();
  };
}
