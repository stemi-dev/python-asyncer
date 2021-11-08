import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import faker from "faker";

import { asyncify, generateTest } from "../lib";
import { Pyodide } from "../type";

const loadPyodide = async () => {
  const pyodide_pkg = await import("pyodide/pyodide.js");
  return await pyodide_pkg.loadPyodide({
    indexURL: "pyodide/",
  });
};

const asyncPython = (pyodide: Pyodide) => {
  return <T>(code: string) => {
    return pyodide.runPythonAsync<T>(code);
  };
};

(async () => {
  const testData = generateTest(require("./input.json"), faker);
  const code = await readFile(join(__dirname, "example.py"), "utf8");

  const out = asyncify(code, "browser", testData);
  await writeFile("./tmp.py", out);

  const py = asyncPython(await loadPyodide());

  // prepare
  await py(out);

  const output = JSON.parse(await py<string>("run_tests()"));
  console.log(output);
})();
