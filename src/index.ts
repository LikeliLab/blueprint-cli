#!/usr/bin/env node

import { run } from './cli.js';
import * as ui from './ui.js';

// Show the title immediately
ui.showTitle('Blueprint CLI');

// Start the main application logic
run().catch((error) => {
  // Catch any unhandled promise rejections from run() - though cli.ts should handle most
  ui.showError('An unexpected top-level error occurred.', error);
  process.exit(1);
});