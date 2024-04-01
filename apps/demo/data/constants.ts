import pkg from '../../../packages/cli/package.json';

export const site = {
  name: pkg.name,
  description: pkg.description,
  author: 'Malki Abderrahmane',
  icon: 'https://react.dev/favicon.ico',
  url: pkg.homepage,
} as const;
