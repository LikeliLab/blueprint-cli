import chalk from 'chalk';
import ora, { Ora } from 'ora'; // Import Ora type for spinner instance
import boxen from 'boxen';

// --- LikeliLab Palette ---
export const parchment = chalk.bgHex('#FBF8F0');
export const graphite = chalk.hex('#3D352E');
export const scholarBlue = chalk.hex('#004E89');
export const likeliPurple = chalk.hex('#6A3E9C');
export const warmTerracotta = chalk.hex('#C8654A');
export const errorRed = chalk.red;
export const warningYellow = chalk.yellow;


// --- UI Functions ---
let currentSpinner: Ora | null = null;

export function showTitle(title: string): void {
  console.log(boxen(
    scholarBlue.bold(title),
    { padding: 1, margin: 1, borderStyle: 'round', borderColor: '#6A3E9C' }
  ));
}

export function showMessage(message: string): void {
  console.log(graphite(message));
}

export function showSuccess(message: string): void {
  console.log(graphite.bold(`✅ ${message}`));
}

export function showCompletion(filePath: string): void {
  console.log(boxen(
    `${graphite('File created at:')} ${warmTerracotta.bold(filePath)}`,
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

export function startSpinner(text: string): void {
  if (currentSpinner) {
    currentSpinner.stop();
  }
  currentSpinner = ora({
    text: likeliPurple(text),
    spinner: 'dots'
  }).start();
}

export function stopSpinner(): void {
  if (currentSpinner) {
    currentSpinner.stop(); // Simply stops the spinner without any symbol or text
    currentSpinner = null;
  }
}

export function succeedSpinner(text: string): void {
  if (currentSpinner) {
    currentSpinner.succeed(graphite(text));
    currentSpinner = null;
  }
}

export function failSpinner(text: string): void {
  if (currentSpinner) {
    currentSpinner.fail(errorRed(text));
    currentSpinner = null;
  }
}