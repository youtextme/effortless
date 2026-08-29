import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const SERVICE_ROOT = join(__dirname, '..');
export const CONFIG_PATH = join(SERVICE_ROOT, 'config.json');
export const AUTH_DIR = join(SERVICE_ROOT, 'data', 'whatsapp-auth');
export const STATE_PATH = join(SERVICE_ROOT, 'data', 'state.json');
