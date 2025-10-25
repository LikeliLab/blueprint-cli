import * as path from 'path';
import * as fs from 'fs';
import { copyFile } from 'fs/promises';
import sanitize from 'sanitize-filename';

/**
 * Securely creates a directory inside a specified base directory.
 * This function will terminate the process with an error if the name
 * is invalid, insecure, or requires sanitization.
 * @param baseDir The only directory where new folders can be created.
 * @param userDirName The untrusted name from user input.
 */
export function createSafeDirectory(baseDir: string, userDirName: string): void {
  // 1. Sanitize the name to remove invalid characters
  const safeName: string = sanitize(userDirName);

  // 2. Check if sanitization changed the name. If so, reject it.
  if (safeName !== userDirName) {
    throw new Error(
        `Invalid characters detected in "${userDirName}". Please provide a valid directory name.`
    );
  }

  // 3. Check for empty or relative-only names
  if (!safeName || safeName === '.' || safeName === '..') {
    throw new Error(`Invalid directory name provided. Input: "${userDirName}"`);
  }

  // 4. Resolve the full, absolute path
  const targetPath: string = path.resolve(baseDir, safeName);
  const resolvedBase: string = path.resolve(baseDir);

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
    } catch (err: any) {
        // Wrap the file system error
        throw new Error(`Failed to create directory: ${err.message}`);
    }
}

export async function copySingleFile(sourceFilePath: string, destinationFilePath: string): Promise<void> {
  try {
    // Overwrites destinationFilePath if it exists by default
    await copyFile(sourceFilePath, destinationFilePath);
  } catch (err: any) {
    throw new Error(`'Error copying file:' ${err.message}`);
  }
}