#!/usr/bin/env node

import { input } from '@inquirer/prompts';
import ejs from 'ejs';
import { promises as fs } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Asks the user a series of questions to gather data for the template.
 */
async function getUserInputs() {
  const name = await input({
    message: 'What is your name?',
    default: 'Guest User',
  });

  const project = await input({
    message: 'What is the project name?',
    validate: (value: string) => value.length > 0 ? true : 'Project name cannot be empty.',
  });

  const outputFile = await input({
    message: 'What should the output file be named?',
    default: 'README.md',
  });

  return { name, project, outputFile };
}

/**
 * Main function to run the CLI tool.
 */
async function run() {
  console.log('Welcome to the EJS File Templater!');

  try {
    // 1. Define paths
    const templateName = 'template.ejs';
    // Use __dirname to find the template relative to the running script's location
    // This will be /.../blueprint-cli/dist, so we go up one level
    const templatePath = path.resolve(__dirname, '..', templateName);

    // 2. Check if template file exists
    try {
      await fs.access(templatePath);
    } catch (error) {
      console.error(`Error: Template file not found at ${templatePath}`);
      console.error(`This file should be part of the 'blueprint-cli' installation.`);
      process.exit(1); // Exit with an error code
    }

    // 3. Get user inputs
    const answers = await getUserInputs();
    // The output path is still the user's current working directory
    const outputPath = path.resolve(process.cwd(), answers.outputFile);

    // 4. Read the template file
    const templateContent = await fs.readFile(templatePath, 'utf-8');

    // 5. Render the template with user data
    // We pass all 'answers' to EJS
    const renderedContent = ejs.render(templateContent, answers);

    // 6. Write the rendered content to the output file
    await fs.writeFile(outputPath, renderedContent);

    console.log(`\nSuccess! ✨`);
    console.log(`File created at: ${outputPath}`);

  } catch (error) {
    console.error('\nAn unexpected error occurred:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Start the application
run();