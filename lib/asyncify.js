const { INDENTS } = require("./const");
const { space, cleanup, formatTestData } = require("./utils");

const globals = require("./templates/globals");
const tests = require("./templates/tests");

/**
 * @param {string} raw
 * @param {'native' | 'browser'} env
 * @param {{input: string[], output: string[], defined: Record<string, string>} | undefined} testData
 */
const asyncify = async (raw, env, testData = undefined) => {
  const lines = cleanup(raw);

  // detect indents
  const parsed = lines.map((line) => {
    const indent = line.match(/^\s*/)?.[0];
    return {
      line: line.slice(indent?.length || 0),
      startOfBlock: line.endsWith(":"),
      indent: indent?.length || 0,
    };
  });

  // TODO: check if it's valid python

  const functionsToAwait = ["input"];
  parsed.forEach((line, index) => {
    if (line.startOfBlock) {
      if (line.line.startsWith("def")) {
        functionsToAwait.push(line.line.split(" ")[1].slice(0, -2));
      } else if (line.line.startsWith("async def")) {
        functionsToAwait.push(line.line.split(" ")[2].slice(0, -2));
      }
    }
  });

  const parsed2 = parsed.map((line, index) => {
    // if is def of a function add async before
    if (line.line.startsWith("def") && line.startOfBlock) {
      return {
        ...line,
        line: `async ${line.line}`,
      };
    }

    functionsToAwait.forEach((func) => {
      if (line.line.includes(func) && !line.startOfBlock) {
        line.line = line.line.replace(func, `await ${func}`);
      }
    });

    return line;
  });

  const replaces = [
    ["print(", "custom_print("],
    ["input(", "custom_input("],
  ];
  const parsed3 = parsed2.map((line) => {
    replaces.forEach(([from, to]) => {
      if (line.line.includes(from)) {
        line.line = line.line.replace(from, to);
      }
    });

    return line;
  });

  const wrappedIntoFunction = [
    ...globals[env].split("\n"),
    "async def func():",
    ...parsed3.map((p) => `${space(p.indent + INDENTS)}${p.line}`),
    `${space(INDENTS)}return locals()`,
    "\n",
    ...tests[env].split("\n"),
  ];

  const out = wrappedIntoFunction.join("\n");
  if (testData) {
    return out.replace("$__DATA__$", formatTestData(testData));
  }

  return out;
};

module.exports = { cleanup, asyncify };
