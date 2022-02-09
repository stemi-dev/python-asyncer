import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import faker from "faker";

import { asyncify, generateTest } from "../lib";
import { MAIN_FUNCTION } from "../lib/const";
import { Pyodide } from "./type";

// const loadPyodide = async () => {
//   const pyodide_pkg = await eval(`import("pyodide/pyodide.js")`);
//   return await pyodide_pkg.loadPyodide({
//     indexURL: "pyodide/",
//   });
// };

// const asyncPython = (pyodide: Pyodide) => {
//   return <T>(code: string) => {
//     return pyodide.runPythonAsync<T>(code);
//   };
// };

process.env["asyncer_dev"] = undefined;

(async () => {
  const testData = generateTest(require("./foo.json"), faker);
  const code = await readFile(join(__dirname, "foo.py"), "utf8");

  const out = asyncify(code, { env: "tests" }, testData);
  await writeFile("./tmp.py", out);

  // const py = asyncPython(await loadPyodide());

  // console.log("here");

  // prepare
  // await py(out);

  console.log(out);

  // const output = JSON.parse(await py<string>(`${MAIN_FUNCTION}()`));
  // console.log(output);
})();
