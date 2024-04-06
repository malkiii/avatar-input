const { homepage } = require('../../packages/cli/package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: new URL(homepage).pathname,
};

module.exports = nextConfig;
