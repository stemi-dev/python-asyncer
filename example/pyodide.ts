import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import faker from "faker";

process.env["asyncer_dev"] = undefined;

import { asyncify, generateTest } from "../lib";
import { MAIN_FUNCTION } from "../lib/const";
import { Pyodide } from "./type";
import { tracebackFormatter } from "../lib/helpers/traceback";

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

(async () => {
  const testData = generateTest(require("./foo.json"), faker);
  const code = await readFile(join(__dirname, "other.py"), "utf8");

  const out = asyncify(code, { env: "tests" }, testData);
  const formattedTraceback = tracebackFormatter(
    `Traceback (most recent call last):
  File "<exec>", line 57, in internal_func_name_user_code
  File "<exec>", line 22, in test_input
IndexError: list index out of range`,
    out,
    {
      stdioInput: "test_input",
      stdioOutput: "test_print",
    }
  );

  console.log(formattedTraceback);

  // await writeFile("./tmp.py", out);

  // const py = asyncPython(await loadPyodide());

  // console.log("here");

  // prepare
  // await py(out);

  // console.log(out);

  // const output = JSON.parse(await py<string>(`${MAIN_FUNCTION}()`));
  // console.log(output);
})();
