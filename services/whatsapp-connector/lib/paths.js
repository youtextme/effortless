import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const SERVICE_ROOT = join(__dirname, '..');
export const JOBS_PATH = join(SERVICE_ROOT, 'jobs.json');
export const AUTH_DIR = join(SERVICE_ROOT, 'data', 'whatsapp-auth');
export const STATE_PATH = join(SERVICE_ROOT, 'data', 'state.json');
export const HTTP_HOST = '127.0.0.1';
export const HTTP_PORT = 8770;
