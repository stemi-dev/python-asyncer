import { INDENTS, INTERNAL_FUNC_NAME_USER_CODE, STDIO_NAMES } from "./const";
import { space, cleanup, formatTestData } from "./utils";
import { GeneratedTest } from "./generateTest";

import { globals, shared, run } from "./templates";

export type AsyncifyENV = "native" | "browser" | "tests";

/**
 * @param {string} raw
 * @param {AsyncifyENV} env
 * @param {GeneratedTest | undefined} testData
 *
 * @throws {Error} if user code contains INTERNAL_FUNC_NAME_USER_CODE
 */
export const asyncify = (raw: string, env: AsyncifyENV, testData?: GeneratedTest) => {
  if (raw.includes(INTERNAL_FUNC_NAME_USER_CODE)) {
    throw new Error(`User code can't contain ${INTERNAL_FUNC_NAME_USER_CODE}`);
  }

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
    ["print(", `${STDIO_NAMES.print}(`],
    ["input(", `${STDIO_NAMES.input}(`],
  ];
  const withCustomSTDIO = withAsyncAwait.map((line) => {
    replaces.forEach(([from, to]) => {
      if (line.line.includes(from)) {
        line.line = line.line.replace(from, to);
      }
    });

    return line;
  });

  const functionCode = withCustomSTDIO
    .map((p) => `${space(p.indent + INDENTS)}${p.line}`)
    .join("\n");

  const output = `
${shared}
${globals[env]}

async def ${INTERNAL_FUNC_NAME_USER_CODE}():
${functionCode}
${space(INDENTS)}return locals()

${run[env]}`.trim();

  if (testData) {
    return output.replace("$__DATA__$", formatTestData(testData));
  }

  return output;
};
