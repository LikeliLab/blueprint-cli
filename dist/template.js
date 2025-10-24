import * as ejs from 'ejs';
import * as fs from 'fs/promises';
import { TEMPLATE_PATH } from './config.js';
export async function renderReadme(data) {
    try {
        const templateContent = await fs.readFile(TEMPLATE_PATH, 'utf-8');
        const renderedContent = ejs.render(templateContent, data);
        return renderedContent;
    }
    catch (error) {
        // Re-throw specific error for better handling upstream
        throw new Error(`Failed to read or render template: ${TEMPLATE_PATH}`, { cause: error });
    }
}
