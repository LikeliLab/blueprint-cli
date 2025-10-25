import * as path from 'path';
import * as fs from 'fs';
import sanitize from 'sanitize-filename';
/**
 * Securely creates a directory inside a specified base directory.
 * This function will terminate the process with an error if the name
 * is invalid, insecure, or requires sanitization.
 * @param baseDir The only directory where new folders can be created.
 * @param userDirName The untrusted name from user input.
 */
export function createSafeDirectory(baseDir, userDirName) {
    // 1. Sanitize the name to remove invalid characters
    const safeName = sanitize(userDirName);
    // 2. Check if sanitization changed the name. If so, reject it.
    if (safeName !== userDirName) {
        throw new Error(`Invalid characters detected in "${userDirName}". Please provide a valid directory name.`);
    }
    // 3. Check for empty or relative-only names
    if (!safeName || safeName === '.' || safeName === '..') {
        throw new Error(`Invalid directory name provided. Input: "${userDirName}"`);
    }
    // 4. Resolve the full, absolute path
    const targetPath = path.resolve(baseDir, safeName);
    const resolvedBase = path.resolve(baseDir);
    // 5. Security Check: Ensure the final path is still inside the base directory.
    // This prevents path traversal (e.g., "../")
    if (!targetPath.startsWith(resolvedBase)) {
        throw new Error(`Directory traversal attempt detected. Input: "${userDirName}"`);
    }
    // 6. Create the directory
    try {
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath);
        }
    }
    catch (err) {
        // Wrap the file system error
        throw new Error(`Failed to create directory: ${err.message}`);
    }
}
