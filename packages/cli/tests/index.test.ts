import { vi, describe, it, expect } from 'vitest';
import pkg from '../package.json';
import path from 'path';

import {
  getPackageInfo,
  getProjectInfo,
  getPackageManager,
  getComponentFileContent,
  convertToJs,
} from '../src';

const nextApp = path.resolve(__dirname, '../fixtures/next-app');
const reactApp = path.resolve(__dirname, '../fixtures/react-app');

describe('CLI command functions', () => {
  it('should', async () => {});
});
