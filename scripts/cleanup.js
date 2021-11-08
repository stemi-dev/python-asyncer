const { join } = require("path");
const { rename } = require("fs/promises");
const { promisify } = require("util");

const rimraf = promisify(require("rimraf"));

(async () => {
  await rimraf(join(__dirname, "../browser"));
  await rimraf(join(__dirname, "../node"));

  await rename(join(__dirname, "../dist/node"), join(__dirname, "../node"));
  await rename(join(__dirname, "../dist/browser"), join(__dirname, "../browser"));
})();
