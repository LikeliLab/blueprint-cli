import { gatherInputs } from './prompts.js';
import { renderReadme } from './template.js';
import { writeReadmeFile } from './file-writer.js';
import * as ui from './ui.js'; // Import all ui functions under 'ui' namespace
import { ReadmeData } from './types.js';

export async function run(): Promise<void> {
  try {
    ui.showMessage('Welcome! Let\'s generate your README.md.\n');

    // 1. Gather Inputs
    const userInput = await gatherInputs();

    // 2. Prepare Data (if any transformation needed)
    const templateData: ReadmeData = {
        ...userInput,
        // Add any other derived data needed specifically for the template here
    };

    // 3. Generate Content
    ui.startSpinner('Generating README.md...');
    let renderedContent: string;
    try {
        renderedContent = await renderReadme(templateData);
    } catch (error) {
        ui.failSpinner('Error reading or rendering template');
        ui.showError('Could not process the EJS template.', error);
        process.exit(1);
    }


    // 4. Write File
    let outputPath: string;
    try {
        outputPath = await writeReadmeFile(renderedContent);
        ui.stopSpinner(); // Stop the spinner cleanly
    } catch (error) {
        ui.failSpinner('Error writing README.md file');
        ui.showError('Could not write the output file.', error);
        process.exit(1);
    }

    // 5. Show Completion Message
    ui.showCompletion(outputPath);

  } catch (error: any) {
    // Handle potential errors from inquirer prompts (e.g., user cancels)
    // Inquirer throws specific errors we might want to catch if needed
    if (error.message.includes('User force closed the prompt')) {
        ui.showWarning('Operation cancelled by user.');
    } else {
        // Catch-all for unexpected errors during orchestration
        ui.showError('An unexpected error occurred during CLI execution.', error);
    }
    process.exit(1); // Exit with error code
  }
}