const { join } = require("path");
const { readdir, mkdir, readFile, writeFile } = require("fs/promises");
const { cleanup, asyncify } = require("../lib/asyncify");

(async () => {
  const files = await readdir(join(__dirname, "../../python-simple-curriculum/pizza"));
  try {
    await readdir(join(__dirname, "./output"));
  } catch (err) {
    // @ts-ignore
    if (err.code === "ENOENT") {
      await mkdir(join(__dirname, "./output"), { recursive: true });
    }
  }

  for (const file of files) {
    const content = await readFile(
      join(__dirname, "../../python-simple-curriculum/pizza", file),
      "utf8"
    );

    const lines = cleanup(content);
    const output = await asyncify(lines, 'native');

    await writeFile(join(__dirname, "./output", file), output);
  }
})();
