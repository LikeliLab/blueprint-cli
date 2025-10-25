import { input, search, select } from '@inquirer/prompts';
import { Ora } from 'ora';
import { 
  likeliPurple,
  startSpinner,
  stopSpinner,
  failSpinner
 } from './feedback.js';
import { UserInputData } from '../types/index.js';

// Type for the collected answers - excluding template-specific derived data
type PromptAnswers = Omit<UserInputData, never>;
const PYTHON_VERSIONS_URL = 'https://raw.githubusercontent.com/actions/python-versions/main/versions-manifest.json';
const FALLBACK_PYTHON_VERSIONS = ['3.15', '3.14', '3.13', '3.12', '3.11', '3.10'];

/**
 * Fetches the list of available Python minor versions.
 * Provides a spinner and a fallback on failure.
 */
async function getAvailablePythonVersions(): Promise<string[]> {
    let spinner: Ora | undefined;
    try {
        spinner = startSpinner('Fetching available Python versions...');
        
        // Fetch with a timeout
        const response = await fetch(PYTHON_VERSIONS_URL, {
            signal: AbortSignal.timeout(5000) // 5-second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // The manifest is an array of objects: { version: "3.11.6", ... }
        const data: { version: string }[] = await response.json();

        // We only care about the minor versions (e.g., "3.11")
        const minorVersions = data.map(item => 
            item.version.split('.').slice(0, 2).join('.')
        );
        
        // Get unique, sorted versions (newest first)
        const uniqueMinorVersions = [...new Set(minorVersions)];
        uniqueMinorVersions.sort((a, b) => {
            const [aMajor, aMinor] = a.split('.').map(Number);
            const [bMajor, bMinor] = b.split('.').map(Number);
            if (aMajor !== bMajor) return bMajor - aMajor;
            return bMinor - aMinor;
        });

        stopSpinner(spinner); // Succeeded, so just stop it
        return uniqueMinorVersions;

    } catch (error) {
        failSpinner(spinner, 'Could not fetch Python versions. Using fallback list.');
        return FALLBACK_PYTHON_VERSIONS; // Return the hardcoded list on any error
    }
}

export async function gatherInputs(): Promise<PromptAnswers> {

  // Fetch the versions *before* showing the prompt
  const pythonVersionsList = await getAvailablePythonVersions();
  
  const packageName = await input({
    message: likeliPurple('Enter your project name:'),
    validate: (value: string) => value.length > 0 || 'Please enter a project name.'
  });
  const packageSrcDirName = packageName.replace(/-/g, "_");

  const pythonVersion = await search({
    message: likeliPurple('Enter or select a Python version:'),
    
    // The `source` function provides the suggestions
    source: async (input: string | undefined) => {
        if (!input) {
            // No input? Show the whole list.
            return pythonVersionsList.map(v => ({ value: v, description: `Python ${v}` }));
        }
        
        // User is typing? Filter the list.
        const filtered = pythonVersionsList.filter(v => v.startsWith(input));
        return filtered.map(v => ({ value: v, description: `Python ${v}` }));
    },
    
    // Validate the *final* answer
    validate: (value: string) => {
        // Regex to check for format like "3.11" or "3.10.13"
        const isValidFormat = /^\d+\.\d+(\.\d+)?$/.test(value);
        if (isValidFormat) {
            return true;
        }
        return 'Please enter a valid version format (e.g., "3.15"").';
    }
  });

  const requiresPythonVersion = `>=${pythonVersion}`;
  const ruffTargetPythonVersion = `py${pythonVersion.replace('.', '')}`;

  const authorName = await input({
    message: likeliPurple('Enter package author name:')  
  });

  const authorEmail = await input({
    message: likeliPurple('Enter package author email:')  
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

  return {
    packageName,
    packageSrcDirName,
    pythonVersion,
    requiresPythonVersion,
    ruffTargetPythonVersion,
    authorName,
    authorEmail,
    license
  };
}