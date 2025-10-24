import * as fs from 'fs/promises';
import * as path from 'path';
import { OUTPUT_FILENAME } from './config.js';
export async function writeReadmeFile(content) {
    const outputPath = path.join(process.cwd(), OUTPUT_FILENAME);
    try {
        await fs.writeFile(outputPath, content);
        return outputPath; // Return the path where the file was written
    }
    catch (error) {
        // Re-throw specific error
        throw new Error(`Failed to write README.md file to: ${outputPath}`, { cause: error });
    }
}
