const { join } = require("path");
const { readFile, writeFile } = require("fs/promises");

const INDENTS = 4;

/**
 * @param {number} n
 */
const space = (n) =>
  Array.from(new Array(n))
    .map(() => " ")
    .join("");

/**
 * @param {string} code
 */
const cleanup = (code) => {
  const tmp = code.split('"""');
  const out = [];
  for (let i = 0; i < tmp.length; i++) {
    if (i % 2 === 0) {
      out.push(tmp[i]);
    }
  }

  const lines = out
    .join("\n")
    .split("\n")
    .filter((a) => !a.startsWith("#"))
    .filter((a) => a.length > 0);

  return lines;
};

/**
 * @param {string[]} lines
 * @param {string} globals
 */
const asyncify = async (lines, globals = "") => {
  // detect indents
  const parsed = lines.map((line, index) => {
    const indent = line.match(/^\s*/)?.[0];
    return {
      line: line.slice(indent?.length || 0),
      startOfBlock: line.endsWith(":"),
      indent: indent?.length || 0,
    };
  });

  // let indent = 0;
  // for (let i = 0; i < parsed.length; i++) {
  //   const line = parsed[i];
  //
  //   if(indent != line.indent) {
  //     throw new Error('u')
  //   }
  //
  //   if(line.startOfBlock) {
  //     indent += 2;
  //   }
  //
  // }

  const functionsToAwait = ["input"];
  parsed.forEach((line, index) => {
    if (line.line.startsWith("def") && line.startOfBlock) {
      functionsToAwait.push(line.line.split(" ")[1].slice(0, -2));
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
      if (line.line.includes(func)) {
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
    ...(await readFile(join(__dirname, `./globals${globals}.py`), "utf8")).split("\n"),
    "async def func():",
    ...parsed3.map((p) => `${space(p.indent + INDENTS)}${p.line}`),
    `${space(INDENTS)}return locals()`,
    "\n",
    ...(await readFile(join(__dirname, `./run${globals}.py`), "utf8")).split("\n"),
  ];

  return wrappedIntoFunction.join("\n");
};

module.exports = {
  cleanup,
  asyncify,
};

if (require.main === module) {
  (async () => {
    const code = await readFile(join(__dirname, "./example.py"), "utf8");
    const out = await asyncify(cleanup(code), "_test");
    await writeFile(join(__dirname, "./out.py"), out, "utf8");
  })();
}
