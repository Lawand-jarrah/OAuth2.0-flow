import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../');


export const config = {
    port: Number(process.env.AUTH_SERVER_PORT),
    clientId: process.env.AUTH_SERVER_CLIENT_ID,
    clientRedirectUri: process.env.CLIENT_REDIRECT_URI,
    issuer: process.env.ISSUER,
    keyId: process.env.KEY_ID,
    dbUrl: process.env.DB_URL,
    sessionCookieName: process.env.SESSION_COOKIE_NAME,
    sessionTtlMs: 8 * 60 * 60 * 1000,
    authorizationCodeTtlMs: 10 * 60 * 1000,
    accessTokenTtlMs: 15 * 60 * 1000,
    refreshTokenTtlMs: 7 * 24 * 60 * 60 * 1000,
    privateKeyPem: fs.readFileSync(path.join(ROOT_DIR, 'private.pem')),
    publicKeyPem: fs.readFileSync(path.join(ROOT_DIR, 'public.pem'))
}

