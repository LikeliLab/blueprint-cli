import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Ora } from 'ora';
import { confirm } from '@inquirer/prompts';
import { gatherInputs } from './ui/prompts.js';
import { renderTemplateFile } from './core/template-renderer.js';
import { createSafeDirectory, copySingleFile } from './core/utils.js';
import { 
    startSpinner,
    stopSpinner,
    succeedSpinner,
    failSpinner,
    showError,
    showCompletion,
    showWarning
} from './ui/feedback.js';
import { UserInputData } from './types/index.js';
import { likeliPurple } from './ui/feedback.js';

// Helper to get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function run(): Promise<void> {
    let spinner: Ora | undefined;

    try {
        // 1. Gather Inputs
        const userInput: UserInputData = await gatherInputs();

        // 2. Define Output Directory Path
        // process.cwd() is the directory where the user *ran* the CLI command
        const outputDir = path.resolve(process.cwd(), userInput.packageName);

        // 3. Create the Output Directory
        spinner = startSpinner(`\n\nChecking directory ${userInput.packageName}...`);
        try {
            await fs.access(outputDir);
            // Directory exists - stop spinner and ask for confirmation
            stopSpinner(spinner); // Stop before prompting
            spinner = undefined; // Clear spinner variable

            const overwrite = await confirm({
                message: likeliPurple(`\n\nDirectory "${userInput.packageName}" already exists. Files might be overwritten. Continue?`),
                default: false // Default to not continuing
            });

            if (!overwrite) {
                showWarning('Operation cancelled by user.');
                process.exit(0); // Exit gracefully
            }
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                if (spinner) spinner.text = `\n\nCreating directory: ${userInput.packageName}...`;
                createSafeDirectory(process.cwd(), userInput.packageName);
                succeedSpinner(spinner, `\n\nCreated directory: ${userInput.packageName}`);
                spinner = undefined;
            } else {
                failSpinner(spinner, 'Failed to check/create directory');
                spinner = undefined;
                throw error;
            }
        }

        // CREATE .python-version FILE
        // 4. Define Source Template Path and Target File Path
        const sourcePath = path.resolve(__dirname, '../templates/python/.python-version');
        const targetPath = path.join(outputDir, '.python-version');

        // 5. Render the single template file with spinner
        const BaseFileName = path.basename(targetPath);
        succeedSpinner(spinner, `Generated ${BaseFileName}`);
        try {
            await renderTemplateFile(sourcePath, targetPath, userInput);
        } catch (error) {
            failSpinner(spinner, `Error generating ${BaseFileName}`);
            showError('Could not process the EJS template.', error);
            process.exit(1);
        }

        // CREATE pyproject.toml FILE
        // 4. Define Source Template Path and Target File Path
        const sourcePyProjectPath = path.resolve(__dirname, '../templates/python/pyproject.toml');
        const targetPyProjectPath = path.join(outputDir, 'pyproject.toml');

        // 5. Render the single template file with spinner
        const pyProjectBasename = path.basename(targetPyProjectPath);
        succeedSpinner(spinner, `Generated ${pyProjectBasename}`);
        try {
            await renderTemplateFile(sourcePyProjectPath, targetPyProjectPath, userInput);
        } catch (error) {
            failSpinner(spinner, `Error generating ${pyProjectBasename}`);
            showError('Could not process the EJS template.', error);
            process.exit(1);
        }

        // CREATE DIRECTORY STRUCTURE AND __init__.py
        const srcDirPath = path.join(outputDir, 'src', userInput.packageSrcDirName);
        const testDirPath = path.join(outputDir, 'tests');
        spinner = startSpinner(`Creating src and tests directories...`);
        try {
            // Creat src directory
            await fs.mkdir(srcDirPath, { recursive: true });
            const initFilePath = path.join(srcDirPath, '__init__.py');
            await fs.writeFile(initFilePath, '# Init file for package\n');

            // Create tests directory
            await fs.mkdir(testDirPath, { recursive: true });
            succeedSpinner(spinner, `Created src and tests directories.`);
            spinner = undefined;
        } catch (error) {
            failSpinner(spinner, 'Failed to create src and tests directories.');
            spinner = undefined;
            throw error;
        }

        // Create python_package_template/main.py
        const mainPySource = path.resolve(__dirname, '../templates/python/python_package_template/main.py');
        const mainPyTarget = path.join(srcDirPath, 'main.py');
        const mainBasename = path.basename(mainPyTarget);
        spinner = startSpinner(`Creating main.py in source directory...`);
        try {
            await renderTemplateFile(mainPySource, mainPyTarget, userInput);
        } catch (error) {
            failSpinner(spinner, `Error generating ${mainBasename}`);
            showError('Could not process the EJS template.', error);
            process.exit(1);
        }

        // Create python_package_template/__init__.py
        const initPySource = path.resolve(__dirname, '../templates/python/python_package_template/__init__.py');
        const initPyTarget = path.join(srcDirPath, '__init__.py');
        const initBasename = path.basename(initPyTarget);
        spinner = startSpinner(`Creating __init__.py in source directory...`);
        try {
            await renderTemplateFile(initPySource, initPyTarget, userInput);
            succeedSpinner(spinner, `Created ${initBasename} in source directory.`);
            spinner = undefined;
        } catch (error) {
            failSpinner(spinner, `Error generating ${initBasename}`);
            showError('Could not process the EJS template.', error);
            process.exit(1);
        }

        // Create tests/test_main.py
        const testMainPySource = path.resolve(__dirname, '../templates/python/tests/test_main.py');
        const testMainPyTarget = path.join(testDirPath, 'test_main.py');
        const testMainBasename = path.basename(testMainPyTarget);
        spinner = startSpinner(`Creating test_main.py in tests directory...`);
        try {
            await renderTemplateFile(testMainPySource, testMainPyTarget, userInput);
            succeedSpinner(spinner, `Created ${testMainBasename} in tests directory.`);
            spinner = undefined;
        } catch (error) {
            failSpinner(spinner, `Error generating ${testMainBasename}`);
            showError('Could not process the EJS template.', error);
            process.exit(1);
        }


        // COPY FILES
        spinner = startSpinner('Copying additional template files...');
        try {
            // Copy a .gitignore file from templates to outputDir
            const gitignoreSource = path.resolve(__dirname, '../templates/python/.gitignore');
            const gitignoreTarget = path.join(outputDir, '.gitignore');
            await copySingleFile(gitignoreSource, gitignoreTarget);

            // Copy .pre-commit-config.yaml
            const precommitSource = path.resolve(__dirname, '../templates/python/.pre-commit-config.yaml');
            const precommitTarget = path.join(outputDir, '.pre-commit-config.yaml');
            await copySingleFile(precommitSource, precommitTarget);

            // Copy README.md
            const readmeSource = path.resolve(__dirname, '../templates/python/README.md');
            const readmeTarget = path.join(outputDir, 'README.md');
            await copySingleFile(readmeSource, readmeTarget);

            // Copy python_package_template/main.py to src/<packageSrcDirName>/main.py
            succeedSpinner(spinner, 'Copied additional template files.');
            spinner = undefined;
        } catch (error) {
            failSpinner(spinner, 'Failed to copy additional template files.');
            spinner = undefined;
            throw error;
        }

        //showCompletion(`${succeedSpinner(spinner, `Generated ${userInput.packageName}`)}`);
        showCompletion(`✅ Successfully created "${userInput.packageName}"!`);

    } catch (error: any) {
        stopSpinner(spinner);
        showError('An unexpected error occurred.', error);
        process.exit(1); // Exit with error code
    }
}