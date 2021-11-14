const { join } = require("path");
const esbuild = require("esbuild");
const rimraf = require("rimraf");

(async () => {
  rimraf.sync(join(__dirname, "../dist"));

  await esbuild.build({
    entryPoints: [join(__dirname, "../lib/index.ts")],
    bundle: true,
    platform: "node",
    target: ["node14"],
    outfile: join(__dirname, "../dist/index.js"),
  });
})();
