import { input, confirm, select } from '@inquirer/prompts';
import { likeliPurple } from './ui.js'; // Import colors
import { ReadmeData } from './types.js';

// Type for the collected answers - excluding template-specific derived data
type PromptAnswers = Omit<ReadmeData, never>;

export async function gatherInputs(): Promise<PromptAnswers> {
  const projectName = await input({
    message: likeliPurple('Enter your project name:'),
  });

  const description = await input({
    message: likeliPurple('Enter a project description:'),
  });

  const author = await input({
    message: likeliPurple('Enter the author\'s name:'),
  });

  const license = await select({
    message: likeliPurple('Choose a license:'),
    choices: [
      { name: 'MIT', value: 'MIT' },
      { name: 'Apache 2.0', value: 'Apache-2.0' },
      { name: 'GPL 3.0', value: 'GPL-3.0' },
      { name: 'None', value: 'UNLICENSED' },
    ],
  });

  const includeContributing = await confirm({
    message: likeliPurple('Include Contributing section?'),
    default: false,
  });

  return {
    projectName,
    description,
    author,
    license,
    includeContributing,
  };
}