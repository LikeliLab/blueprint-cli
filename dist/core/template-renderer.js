import * as fs from 'fs/promises';
import * as ejs from 'ejs';
/**
 * Reads a template file, renders it with EJS, and writes to a target file.
 * @param sourceFilePath - The absolute path to the source template file.
 * @param targetFilePath - The absolute path where the rendered output should be written.
 * @param data - The user input data object for EJS rendering.
 */
export async function renderTemplateFile(sourceFilePath, targetFilePath, data) {
    try {
        const templateContent = await fs.readFile(sourceFilePath, 'utf-8');
        const renderedContent = ejs.render(templateContent, data);
        await fs.writeFile(targetFilePath, renderedContent);
    }
    catch (error) {
        console.error(`Error rendering template file ${sourceFilePath} to ${targetFilePath}:`, error);
        throw error;
    }
}
