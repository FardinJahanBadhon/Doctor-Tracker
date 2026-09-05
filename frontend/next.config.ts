import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The on-screen dev route indicator renders a hidden placeholder div as the very
  // first node in <body>. Some browser extensions (e.g. Bitdefender) stamp an
  // attribute onto it before React hydrates, which reports as a false-positive
  // hydration mismatch on every page load. Compile/runtime error overlays still work
  // with this disabled — only the small route-info badge is removed.
  devIndicators: false,
};

export default nextConfig;
