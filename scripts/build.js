const { join } = require("path");
const esbuild = require("esbuild");
const rimraf = require("rimraf");
// @ts-ignore
const browserslistToEsbuild = require("browserslist-to-esbuild");

/**
 * @type {import('esbuild').BuildOptions}
 */
const shared = {
  entryPoints: [join(__dirname, "../lib/index.ts")],
  bundle: true,
};

(async () => {
  rimraf.sync(join(__dirname, "../dist"));

  await Promise.all([
    esbuild.build({
      ...shared,
      minify: true,
      sourcemap: true,
      platform: "browser",
      target: "es2020",
      outfile: join(__dirname, "../dist/browser/index.js"),
    }),

    esbuild.build({
      ...shared,
      platform: "node",
      target: ["node14"],
      outfile: join(__dirname, "../dist/node/index.js"),
    }),
  ]);
})();
