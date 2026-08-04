import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));

await build({
  absWorkingDir: projectRoot,
  entryPoints: ["server.ts"],
  resolveExtensions: [".ts", ".tsx", ".js"],
  tsconfigRaw: {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Bundler",
      skipLibCheck: true,
    },
  },
  bundle: true,
  platform: "node",
  format: "cjs",
  packages: "external",
  sourcemap: true,
  outfile: path.join("dist", "server.cjs"),
});
