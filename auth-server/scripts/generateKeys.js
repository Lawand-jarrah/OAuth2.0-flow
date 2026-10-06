import { generateKeyPairSync } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

const privateKeyPath = path.join(ROOT_DIR, 'private.pem');
const publicKeyPath = path.join(ROOT_DIR, 'public.pem');

if (fs.existsSync(privateKeyPath) || fs.existsSync(publicKeyPath)) {
    console.log('Key files already exist. Skipping key generation.');
    process.exit(0);
}

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

fs.writeFileSync(privateKeyPath, privateKey);
fs.writeFileSync(publicKeyPath, publicKey);
console.log('Key files generated successfully.');