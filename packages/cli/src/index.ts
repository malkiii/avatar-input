import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { execa } from 'execa';
import ora from 'ora';

import {
  getPackageInfo,
  getProjectInfo,
  getPackageManager,
  getComponentFileContent,
  log,
} from './utils';

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

      fs.mkdirSync(path.resolve(directory, project.componentsDir), { recursive: true });

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

main();
