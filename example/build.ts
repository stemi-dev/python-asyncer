import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import faker from "faker";

import { asyncify, generateTest } from "../lib";

process.env["asyncer_dev"] = undefined;

(async () => {
  const testData = generateTest(require("./example.json"), faker);
  const code = await readFile(join(__dirname, "example.py"), "utf8");

  const out = asyncify(code, { env: "tests" }, testData);
  await writeFile("./tmp.py", out);
})();
