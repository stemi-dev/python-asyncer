const { join } = require("path");
const esbuild = require("esbuild");

(async () => {
  await esbuild.build({
    entryPoints: [join(__dirname, "../lib/index.ts")],
    bundle: true,
    platform: "node",
    target: ["node14"],
    outfile: join(__dirname, "../index.js"),
  });
})();
