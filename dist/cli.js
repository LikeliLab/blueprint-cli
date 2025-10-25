import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { confirm } from '@inquirer/prompts';
import { gatherInputs } from './ui/prompts.js';
import { renderTemplateFile } from './core/template-renderer.js';
import { createSafeDirectory } from './core/create-directory.js';
import { startSpinner, stopSpinner, succeedSpinner, failSpinner, showError, showCompletion, showWarning } from './ui/feedback.js';
import { likeliPurple } from './ui/feedback.js';
// Helper to get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function run() {
    let spinner;
    try {
        // 1. Gather Inputs
        const userInput = await gatherInputs();
        // 2. Define Output Directory Path
        // process.cwd() is the directory where the user *ran* the CLI command
        const outputDir = path.resolve(process.cwd(), userInput.projectName);
        // 3. Create the Output Directory
        spinner = startSpinner(`Checking directory ${userInput.projectName}...`);
        try {
            await fs.access(outputDir);
            // Directory exists - stop spinner and ask for confirmation
            stopSpinner(spinner); // Stop before prompting
            spinner = undefined; // Clear spinner variable
            const overwrite = await confirm({
                message: likeliPurple(`Directory "${userInput.projectName}" already exists. Files might be overwritten. Continue?`),
                default: false // Default to not continuing
            });
            if (!overwrite) {
                showWarning('Operation cancelled by user.');
                process.exit(0); // Exit gracefully
            }
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                if (spinner)
                    spinner.text = `Creating directory: ${userInput.projectName}...`;
                createSafeDirectory(process.cwd(), userInput.projectName);
                succeedSpinner(spinner, `Created directory: ${userInput.projectName}`);
                spinner = undefined;
            }
            else {
                failSpinner(spinner, 'Failed to check/create directory');
                spinner = undefined;
                throw error;
            }
        }
        // 4. Define Source Template Path and Target File Path
        const sourcePath = path.resolve(__dirname, '../templates/python/.python-version');
        const targetPath = path.join(outputDir, '.python-version');
        // 5. Render the single template file with spinner
        const readmeBasename = path.basename(targetPath);
        succeedSpinner(spinner, `Generated ${readmeBasename}`);
        try {
            await renderTemplateFile(sourcePath, targetPath, userInput);
        }
        catch (error) {
            failSpinner(spinner, `Error generating ${readmeBasename}`);
            showError('Could not process the EJS template.', error);
            process.exit(1);
        }
        showCompletion(`✅ Successfully created directory and generated README.md in "${userInput.projectName}"!`);
    }
    catch (error) {
        stopSpinner(spinner);
        showError('An unexpected error occurred.', error);
        process.exit(1); // Exit with error code
    }
}
