#! /usr/bin/env node
import './env.js';

import fs from 'fs';

import { program } from 'commander';

const { description, version } = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)).toString());

program
  .description(description)
  .version(version)
  .command('serve', 'Start the federation API server')
  .parse(process.argv);
