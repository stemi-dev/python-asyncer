const { join } = require("path");
const { readdir, mkdir, readFile, writeFile } = require("fs/promises");
const { asyncify } = require("../lib");

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

    const output = await asyncify(content, "native");

    await writeFile(join(__dirname, "./output", file), output);
  }
})();
