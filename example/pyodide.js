const { join } = require("path");
const { readFile, writeFile } = require("fs/promises");
const faker = require('faker');

const formatInput = require("../lib/testGenerator");
const { asyncify, cleanup } = require("../lib/asyncify");

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
  const test = require("./input.json");
  const formattedTest = formatInput(test, faker);

  const code = await readFile(join(__dirname, "example.py"), "utf8");
  let out = await asyncify(cleanup(code), "browser");
  out = out.replace(
    "$__DATA__$",
    `inputs = ${JSON.stringify(formattedTest.input)}
expected_definitions = ${JSON.stringify(formattedTest.defined)}
expected_outputs = ${JSON.stringify(formattedTest.output)}`
  );

  await writeFile("./tmp.py", out);

  const py = asyncPython(await loadPyodide());

  // prepare
  await py(out);
  const output = await py("run_tests()");
  console.log(JSON.parse(output));
  // console.log(JSON.parse(output).filter((a) => !a.test_pass));
})();
