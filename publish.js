const zx = require("zx");
const fs = require("fs/promises");
const { parse, inc } = require("semver");

const pkg = require("./package.json");

(async () => {
  if (process.argv.length !== 3) {
    console.log("You need exactly one param (major/minor/patch)");
    process.exit(1);
  }

  const action = process.argv[2];
  if (!["major", "minor", "patch"].includes(action)) {
    console.log("Action not supported");
    process.exit(1);
  }

  // @ts-ignore
  const newVersion = inc(pkg["version"], action);
  console.log(newVersion);

  // @ts-ignore
  pkg.version = newVersion;

  await fs.writeFile("./package.json", JSON.stringify(pkg, null, 2));

  const message = `"New release ${newVersion}"`;

  await zx.$`git add package.json`;
  await zx.$`git commit -m ${message}`;
  await zx.$`git push`;
  await zx.$`gh release create v${newVersion} --notes ${message}`;
})();
