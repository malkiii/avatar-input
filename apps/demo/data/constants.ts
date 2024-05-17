import pkg from '../../../package.json';

export const site = {
  name: pkg.name,
  description: pkg.description,
  author: pkg.author,
  icon: 'https://react.dev/favicon.ico',
  github: pkg.repository.url,
  url: pkg.homepage,
} as const;
