import * as path from 'path';
import { fileURLToPath } from 'url';

// Helper for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust the path according to your build output structure
// If 'dist' is the output dir, '..' goes up one level from 'dist/config.js'
export const TEMPLATE_PATH = path.join(__dirname, '..', 'template.ejs');
export const OUTPUT_FILENAME = 'README.md';