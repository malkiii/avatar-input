import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { type PackageJson } from 'type-fest';
// @ts-ignore
import transformTypescript from '@babel/plugin-transform-typescript';
import babel from '@babel/core';
import { Command } from 'commander';
import { execa } from 'execa';
import ora from 'ora';

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

async function main() {
  const pkg = getPackageInfo();

  const program = new Command()
    .name(pkg.name)
    .version(pkg.version)
    .description(pkg.description)
    .argument('<directory>', 'the directory to add the component to', process.cwd())
    .option('-p, --path <path>', 'the path to add the component to.')
    .action(async (directory, options) => {
      validateProjectDirectory(directory);

      const spinner = ora('Cloning the component...').start();

      const project = getProjectInfo(directory, options.path);

      const componentName = `ImageInput.${project.isTsProject ? 'tsx' : 'jsx'}`;
      const componentContent = await getComponentFileContent(pkg.repository, project.isTsProject);
      const contentPrefix = project.isUsingRSC ? "'use client';\n\n" : '';

      fs.writeFileSync(
        path.resolve(directory, project.componentsDir, componentName),
        contentPrefix + componentContent,
      );

      spinner.start('Installing dependencies...');

      await installDependencies(directory);

      spinner.stop();
      log.success('Done.');
    });

  program.parse();
}

function validateProjectDirectory(cwd: string) {
  if (!fs.existsSync(cwd)) {
    log.error(`the folder '${cwd}' does not exist.`);
    process.exit(1);
  }

  if (!fs.statSync(cwd).isDirectory()) {
    log.error(`'${cwd}' is not a directory.`);
    process.exit(1);
  }

  if (!fs.existsSync(path.join(cwd, 'package.json'))) {
    log.error(`'${cwd}' is not a valid project directory.`);
    process.exit(1);
  }
}

export function getPackageInfo() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const pkg = JSON.parse(fs.readFileSync(path.join(dirname, 'package.json'), 'utf-8'));

  return {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    repository: new URL(pkg.repository.url).pathname,
  } satisfies PackageJson;
}

export async function getComponentFileContent(repository: string, isTsx: boolean) {
  const baseUrl = 'https://raw.githubusercontent.com';
  const componentPath = 'apps/demo/components/image-input.tsx';
  const branch = 'main';

  try {
    const response = await fetch(new URL(`${repository}/${branch}/${componentPath}`, baseUrl));
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

async function installDependencies(cwd: string) {
  const pm = getPackageManager(cwd);

  const dependencies = ['react-pre-hooks'];

  try {
    await execa(pm, [pm === 'npm' ? 'install' : 'add', ...dependencies], { cwd });
  } catch (error) {
    log.error('Failed to install dependencies:', error);
    process.exit(1);
  }
}

const log = {
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

main();
