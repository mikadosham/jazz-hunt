import { fileURLToPath } from "url";
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Extend Webpack configuration
  webpack: (config, { isServer }) => {
    // Handle PDF files
    config.module.rules.push({
      test: /\.pdf$/,
      use: "file-loader", // Or 'url-loader' if preferred
    });

    // Fix issues with pdfjs-dist for both server and client
    const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Define __dirname
    if (!isServer) {
      config.resolve.alias["pdfjs-dist"] = path.resolve(
        __dirname,
        "node_modules/pdfjs-dist"
      );
    }

    return config;
  },
};

export default nextConfig;
