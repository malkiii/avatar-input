import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { type PackageJson } from 'type-fest';
// @ts-ignore
import transformTypescript from '@babel/plugin-transform-typescript';
import babel from '@babel/core';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');
export const componentPath = 'apps/demo/components/image-input.tsx';

export function getPackageInfo() {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));

  return {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    repository: new URL(pkg.repository.url).pathname,
  } satisfies PackageJson;
}

export async function getComponentFileContent(repo: string, isTsx: boolean) {
  const baseUrl = 'https://raw.githubusercontent.com';
  const branch = 'main';

  try {
    const response = await fetch(new URL(path.join(repo, branch, componentPath), baseUrl));
    const fileContent = await response.text();

    return isTsx ? fileContent : convertToJs(fileContent);
  } catch (error) {
    log.error('Failed to fetch component file:', error);
    process.exit(1);
  }
}

export function getProjectInfo(cwd: string, componentsPath?: string) {
  const srcDir = fs.existsSync(path.resolve(cwd, 'src')) ? 'src/' : '';

  const isNextProject = fs.readdirSync(cwd).some((file) => file.startsWith('next.config.'));

  return {
    isTsProject: fs.existsSync(path.resolve(cwd, 'tsconfig.json')),
    isUsingRSC: isNextProject && fs.existsSync(path.resolve(cwd, `${srcDir}app`)),
    componentsDir: componentsPath ?? `${srcDir}components/ui`,
  };
}

export function getPackageManager(cwd: string) {
  const packageManagers = ['npm', 'yarn', 'pnpm', 'bun'] as const;

  const lockFiles = {
    npm: path.resolve(cwd, 'package-lock.json'),
    yarn: path.resolve(cwd, 'yarn.lock'),
    pnpm: path.resolve(cwd, 'pnpm-lock.yaml'),
    bun: path.resolve(cwd, 'bun.lock'),
  };

  return packageManagers.find((pm) => fs.existsSync(lockFiles[pm])) ?? 'npm';
}

export function convertToJs(tsCode: string) {
  try {
    const result = babel.transformSync(tsCode, {
      plugins: [
        [
          transformTypescript,
          {
            isTSX: true,
            parserOpts: { strictMode: true },
          },
        ],
      ],
    });

    if (!result?.code) {
      throw new Error('No result from tsx transformation');
    }

    return result.code;
  } catch (err) {
    log.error('Error converting the component to JS:', err);
    process.exit(1);
  }
}

export const log = {
  error(...args: unknown[]) {
    console.log('❌ ERROR:', ...args);
  },
  warn(...args: unknown[]) {
    console.log('⚠️ WARNING:', ...args);
  },
  success(...args: unknown[]) {
    console.log('✅ SUCCESS:', ...args);
  },
};
