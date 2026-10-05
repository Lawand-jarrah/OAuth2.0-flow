import pg from "pg";
import { createUserRepository } from "../repositories/user.repository.js";
import { createClientRepository } from "../repositories/client.repository.js";
import { createAuthCodeRepository } from "../repositories/authCode.repository.js";
import { createAuthSessionRepository } from "../repositories/authSession.repository.js";
import { createRefreshTokenRepository } from "../repositories/refreshToken.repository.js";

const SCHEMA = `
    CREATE TABLE IF NOT EXISTS clients (
        client_id           TEXT PRIMARY KEY,
        redirect_uris       TEXT[] NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
        sub                 TEXT PRIMARY KEY,
        name                TEXT NOT NULL,
        email               TEXT UNIQUE NOT NULL,
        password_hash       TEXT NOT NULL,
        password_salt       TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
        session_id          TEXT PRIMARY KEY,
        user_sub            TEXT NOT NULL REFERENCES users(sub),
        expires_at          TIMESTAMP WITH THE TIME ZONE NOT NULL,
        FOREIGN KEY (user_sub) REFERENCES users(sub) ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_codes (
        code                TEXT PRIMARY KEY,
        client_id           TEXT NOT NULL,
        redirect_uri        TEXT NOT NULL,
        code_challenge      TEXT NOT NULL,
        user_sub            TEXT NOT NULL,
        user_name           TEXT NOT NULL,
        user_email          TEXT NOT NULL,
        scope               TEXT NOT NULL,
        expires_at          TIMESTAMP WITH THE TIME ZONE NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(client_id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (user_sub) REFERENCES users(sub)          ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
        token               TEXT PRIMARY KEY,
        user_sub            TEXT NOT NULL,
        client_id           TEXT NOT NULL,
        scope               TEXT NOT NULL,
        expires_at          TIMESTAMP WITH THE TIME ZONE NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(client_id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (user_sub)  REFERENCES users(sub)         ON UPDATE CASCADE ON DELETE CASCADE
    );
`;

export async function createDatabase(connectionString) {
  const pool = new pg.Pool({ connectionString });
  await pool.query(SCHEMA);

  return {
    users: createUserRepository(pool),
    clients: createClientRepository(pool),
    authCodes: createAuthCodeRepository(pool),
    authSessions: createAuthSessionRepository(pool),
    refreshTokens: createRefreshTokenRepository(pool),
    close: () => pool.end(),
  };
}
