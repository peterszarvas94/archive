import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const repoRoot = __dirname;
const srcRoot = path.resolve(repoRoot, "src");
const ignoredDirectories = new Set([".git", "dist", "node_modules"]);

function collectHtmlFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        return [];
      }
      return collectHtmlFiles(path.join(directory, entry.name));
    }
    if (entry.isFile() && entry.name.endsWith(".html")) {
      return path.join(directory, entry.name);
    }
    return [];
  });
}

const htmlFiles = collectHtmlFiles(srcRoot);
const inputs = Object.fromEntries(
  htmlFiles.map((filePath) => {
    const relativePath = path.relative(srcRoot, filePath);
    const entryName = relativePath.replace(/\.html$/u, "");
    return [entryName, filePath];
  }),
);

export default defineConfig({
  appType: "mpa",
  root: srcRoot,
  build: {
    assetsDir: "",
    rollupOptions: {
      input: inputs,
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name
            ? assetInfo.name.replaceAll("\\", "/")
            : "assets/[name][extname]",
      },
    },
    emptyOutDir: true,
    outDir: path.resolve(repoRoot, "dist"),
  },
});
