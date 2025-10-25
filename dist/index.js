#!/usr/bin/env node
import { run } from './cli.js';
import * as ui from './ui/feedback.js';
import { likeliPurple, scholarBlue, graphite } from './ui/feedback.js';
// 1. Build the main title
const title = graphite.bold(`Welcome to ${scholarBlue('Blueprint CLI')} by `);
// 2. Define the subtitle
const company = graphite(`${likeliPurple('LikeliLab')}!`);
// 3. Define your new description
const description = graphite('Automate your Python package setup.');
// 4. Combine all parts
ui.showTitle(`${title}` +
    `${company}\n\n` +
    `${description}`);
// Start the main application logic
run().catch((error) => {
    // Catch any unhandled promise rejections from run() - though cli.ts should handle most
    ui.showError('An unexpected top-level error occurred.', error);
    process.exit(1);
});
