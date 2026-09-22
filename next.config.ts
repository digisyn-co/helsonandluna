import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Import .glsl files as strings: `import frag from "@/shaders/x.frag.glsl"`
    rules: { "*.glsl": { loaders: ["raw-loader"], as: "*.js" } },
  },
  webpack: (config) => {
    config.module.rules.push({ test: /\.glsl$/, type: "asset/source" });
    return config;
  },
};

export default nextConfig;
