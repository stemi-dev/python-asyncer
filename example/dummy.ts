process.env["asyncer_dev"] = "true";

import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { asyncify } from "../lib";

(async () => {
  const code = await readFile(join(__dirname, "dummy.py"), "utf8");

  const out = asyncify(code, { env: "browser" });
  await writeFile(join(__dirname, "./dummy_out.py"), out);
})();
