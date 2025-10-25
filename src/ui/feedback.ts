import chalk from 'chalk';
import ora, { Ora } from 'ora'; // Import Ora type for spinner instance
import boxen from 'boxen';

// --- LikeliLab Palette ---
export const parchment = chalk.bgHex('#FBF8F0');
export const graphite = chalk.hex('#3D352E');
export const scholarBlue = chalk.hex('#004E89');
export const likeliPurple = chalk.hex('#6A3E9C');
export const warmTerracotta = chalk.hex('#D96C4A');
export const errorRed = chalk.red;
export const warningYellow = chalk.yellow;


// --- UI Functions ---
let currentSpinner: Ora | null = null;

export function showTitle(content: string): void {
  console.log(boxen(
    content,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: '#6A3E9C',
      textAlignment: 'center'
    }
  ));
}

export function showMessage(message: string): void {
  console.log(warmTerracotta.bold(message));
}

export function showSuccess(message: string): void {
  console.log(graphite.bold(`✅ ${message}`));
}

export function showCompletion(message: string): void {
  console.log(boxen(
    `${warmTerracotta.bold(message)}`,
    { padding: 1, margin: 1, borderStyle: 'double', borderColor: '#6A3E9C' }
  ));
}

export function showError(message: string, error?: any): void {
    console.error(errorRed.bold(`❌ Error: ${message}`));
    if (error && error.message) {
        console.error(errorRed(error.message));
    } else if (error) {
        console.error(errorRed(String(error)));
    }
}

export function showWarning(message: string): void {
    console.log(warningYellow(`⚠️ ${message}\n`));
}

/**
 * Creates and starts an ora spinner.
 * @param text The initial text for the spinner.
 * @returns The Ora instance.
 */
export function startSpinner(text: string): Ora {
  // Stop any potentially lingering global spinner before starting a new one
  if (currentSpinner) {
    currentSpinner.stop();
  }
  const spinner = ora({
    text: likeliPurple(text),
    spinner: 'dots' // Or your preferred spinner style
  }).start();
  currentSpinner = spinner; // Track the latest one
  return spinner; // Return the created instance
}

/**
 * Stops a specific spinner instance.
 * @param spinnerInstance The Ora instance to stop.
 */
export function stopSpinner(spinnerInstance: Ora | undefined | null): void {
  if (spinnerInstance) {
    spinnerInstance.stop();
    // Clear global tracker if it matches
    if (currentSpinner === spinnerInstance) {
        currentSpinner = null;
    }
  }
}

/**
 * Stops a specific spinner instance with a success message.
 * @param spinnerInstance The Ora instance to succeed.
 * @param text The success text.
 */
export function succeedSpinner(spinnerInstance: Ora | undefined | null, text: string): void {
  if (spinnerInstance) {
    spinnerInstance.succeed(likeliPurple(text));
    // Clear global tracker if it matches
    if (currentSpinner === spinnerInstance) {
        currentSpinner = null;
    }
  }
}

/**
 * Stops a specific spinner instance with a failure message.
 * @param spinnerInstance The Ora instance to fail.
 * @param text The failure text.
 */
export function failSpinner(spinnerInstance: Ora | undefined | null, text: string): void {
  if (spinnerInstance) {
    spinnerInstance.fail(errorRed.bold(text));
    // Clear global tracker if it matches
    if (currentSpinner === spinnerInstance) {
        currentSpinner = null;
    }
  }
}