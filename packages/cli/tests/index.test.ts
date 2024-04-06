import { vi, describe, it, expect } from 'vitest';
import pkg from '../package.json';
import path from 'path';
import fs from 'fs';

import {
  componentPath,
  getPackageInfo,
  getProjectInfo,
  getPackageManager,
  getComponentFileContent,
} from '../src/utils';

const rootDir = path.resolve(__dirname, '../../../');
const repo = `/malkiii/${pkg.name}`;

const nextApp = path.resolve(__dirname, 'fixtures/next-app');
const reactApp = path.resolve(__dirname, 'fixtures/react-app');

describe('CLI command functions', () => {
  it('should get the right CLI infos', () => {
    const info = getPackageInfo();
    expect(info.name).toEqual(pkg.name);
    expect(info.repository).toEqual(repo);
  });

  it('should get the right project infos', () => {
    // Using the Next app
    const componentsPath = 'app/__components';
    const nextInfo = getProjectInfo(nextApp, componentsPath);

    expect(nextInfo.isTsProject).toBe(true);
    expect(nextInfo.isUsingRSC).toBe(true);
    expect(nextInfo.componentsDir).toEqual(componentsPath);

    // Using the React app
    const reactInfo = getProjectInfo(reactApp);

    expect(reactInfo.isTsProject).toBe(false);
    expect(reactInfo.isUsingRSC).toBe(false);
    expect(reactInfo.componentsDir).toEqual('src/components/ui');
  });

  it('should get the right package manager', () => {
    const nextPM = getPackageManager(nextApp);
    const reactPM = getPackageManager(reactApp);
    const rootPM = getPackageManager(rootDir);

    expect(nextPM).toEqual('npm');
    expect(reactPM).toEqual('yarn');
    expect(rootPM).toEqual('pnpm');
  });

  it('should fetch the component content from GitHub', async () => {
    const content = fs.readFileSync(path.resolve(rootDir, componentPath), 'utf-8');

    const githubContent = await getComponentFileContent(repo, true);

    expect(content).toEqual(githubContent);
  });
});
