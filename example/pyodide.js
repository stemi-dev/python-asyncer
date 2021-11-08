const { join } = require("path");
const { readFile, writeFile } = require("fs/promises");
const faker = require("faker");

const { asyncify, generateTest } = require("../lib");

const loadPyodide = async () => {
  const pyodide_pkg = await import("pyodide/pyodide.js");
  return await pyodide_pkg.loadPyodide({
    indexURL: "pyodide/",
  });
};

const asyncPython = (pyodide) => (code) => {
  return pyodide.runPythonAsync(code);
};

(async () => {
  const testData = generateTest(require("./input.json"), faker);
  const code = await readFile(join(__dirname, "example.py"), "utf8");

  const out = await asyncify(code, "browser", testData);
  await writeFile("./tmp.py", out);

  const py = asyncPython(await loadPyodide());

  // prepare
  await py(out);
  const output = await py("run_tests()");
  console.log(JSON.parse(output));
  // console.log(JSON.parse(output).filter((a) => !a.test_pass));
})();
