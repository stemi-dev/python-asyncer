import { INDENTS } from "./const";
import { space, cleanup, formatTestData } from "./utils";
import { GeneratedTest } from "./generateTest";

import { globals, tests } from "./templates";

export type AsyncifyENV = "native" | "browser";

/**
 * @param {string} raw
 * @param {AsyncifyENV} env
 * @param {GeneratedTest | undefined} testData
 */
export const asyncify = (raw: string, env: AsyncifyENV, testData?: GeneratedTest) => {
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
  parsed.forEach((line) => {
    if (line.startOfBlock) {
      if (line.line.startsWith("def")) {
        functionsToAwait.push(line.line.split(" ")[1].slice(0, -2));
      } else if (line.line.startsWith("async def")) {
        functionsToAwait.push(line.line.split(" ")[2].slice(0, -2));
      }
    }
  });

  const withAsyncAwait = parsed.map((line, index) => {
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
  const withCustomSTDIO = withAsyncAwait.map((line) => {
    replaces.forEach(([from, to]) => {
      if (line.line.includes(from)) {
        line.line = line.line.replace(from, to);
      }
    });

    return line;
  });

  const final = [
    ...globals[env].split("\n"),
    "async def func():",
    ...withCustomSTDIO.map((p) => `${space(p.indent + INDENTS)}${p.line}`),
    `${space(INDENTS)}return locals()`,
    "\n",
    ...tests[env].split("\n"),
  ];

  const output = final.join("\n");
  if (testData) {
    return output.replace("$__DATA__$", formatTestData(testData));
  }

  return output;
};
