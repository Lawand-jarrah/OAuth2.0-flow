import { randomBytes, createHash, scryptSync, timingSafeEqual } from "crypto";

export function base64url(input) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function sha256Base64url(input) {
  return base64url(createHash("sha256").update(input).digest());
}

export function generateOpaqueCode() {
  return base64url(randomBytes(32));
}

export function hashPassword(password, salt) {
  return scryptSync(password, salt, 64).toString("base64");
}

export function verifyPassword(password, salt, expectedHash) {
  const actualHash = hashPassword(password, salt);
  return timingSafeEqual(
    Buffer.from(actualHash, "base64"),
    Buffer.from(expectedHash, "base64"),
  );
}
