const { join } = require("path");
const { rename } = require("fs/promises");
const { promisify } = require("util");

const rimraf = promisify(require("rimraf"));

(async () => {
  await rimraf(join(__dirname, "../*.d.ts"));
  await rimraf(join(__dirname, "../templates"));
  await rimraf(join(__dirname, "../index.js"));
})();
