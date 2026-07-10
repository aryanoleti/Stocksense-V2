import type { NextConfig } from "next";

// Derive the repo name from the Actions environment so the same code deploys
// correctly to GitHub Pages from any repo (basePath must match the repo name).
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "stocksense-the-goat";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_ACTIONS ? `/${repo}` : "",
  assetPrefix: process.env.GITHUB_ACTIONS ? `/${repo}/` : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.GITHUB_ACTIONS ? `/${repo}` : "",
  },
};

export default nextConfig;
