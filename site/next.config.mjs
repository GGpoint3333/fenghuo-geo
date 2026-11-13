/** @type {import('next').NextConfig} */
// Restricted build hosts (e.g. agent/CI sandboxes that forbid child_process.fork)
// set FENGHUO_SANDBOX_BUILD=1. Normal machines keep Next's default workers.
const sandbox = process.env.FENGHUO_SANDBOX_BUILD === '1';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(sandbox
    ? {
        experimental: {
          webpackBuildWorker: false, // compile in the current process
          workerThreads: true, // use threads instead of forked processes
        },
      }
    : {}),
};

export default nextConfig;
