import { INTERNAL_FUNC_NAME_USER_CODE } from "./const";
import { cleanup, formatTestData, space } from "./utils";
import { GeneratedTest } from "./generateTest";
import { polyfills, run, shared } from "./templates";
import { Config, defaultConfig } from "./config";

export type AsyncifyENV = "native" | "browser" | "tests";

const isDev = process.env["asyncer_dev"] === "true";

type Line = {
  line: string;
  sob: boolean;
  loop: "for" | "while" | false;
  indent: number;
};

/**
 * @param {string} raw
 * @param {Config} config
 * @param {GeneratedTest | undefined} testData
 *
 * @throws {Error} if user code contains INTERNAL_FUNC_NAME_USER_CODE
 */
export const asyncify = (raw: string, config?: Partial<Config>, testData?: GeneratedTest) => {
  if (raw.includes(INTERNAL_FUNC_NAME_USER_CODE)) {
    throw new Error(`User code can't contain ${INTERNAL_FUNC_NAME_USER_CODE}`);
  }

  const finalConfig = { ...defaultConfig, ...config };
  const { env, indents, maxIterations, stdioInput, stdioOutput } = finalConfig;

  if (isDev) {
    console.log(finalConfig);
  }

  const lines = cleanup(raw);

  // detect indents
  const parsed: Line[] = lines.map((line) => {
    const indent = line.match(/^\s*/)?.[0];
    return {
      line: line.slice(indent?.length || 0),
      sob: line.endsWith(":"),
      loop: line.startsWith("for") ? "for" : line.startsWith("while") ? "while" : false,
      indent: indent?.length || 0,
    };
  });

  // TODO: check if it's valid python

  const isDunder = (line?: string) => line && line.startsWith("__") && line.endsWith("__");

  const functionsToAwait = ["input", "sleep"];
  parsed.forEach((line) => {
    if (line.sob) {
      let methodName: string | undefined;
      if (line.line.startsWith("def")) {
        methodName = line.line.match(/^\s*def\s+(\w+)/)?.[1];
      } else if (line.line.startsWith("async def")) {
        methodName = line.line.match(/^\s*async def\s+(\w+)/)?.[1];
      }

      if (methodName && !isDunder(methodName)) {
        functionsToAwait.push(methodName);
      }
    }
  });

  if (isDev) {
    console.log(functionsToAwait);
  }

  const withAsyncAwait = parsed.map((line) => {
    // if is def of a function add async before
    if (
      line.line.startsWith("def") &&
      line.sob &&
      !isDunder(line.line.match(/^\s*def\s+(\w+)/)?.[1])
    ) {
      return {
        ...line,
        line: `async ${line.line}`,
      };
    }

    functionsToAwait.forEach((func) => {
      if (line.line.includes(func) && !line.sob) {
        line.line = line.line.replace(func, `await ${func}`);
      }
    });

    return line;
  });

  const maxIterError = (name: string) => {
    return `raise RuntimeError(f"Max number of iterations exceeded (${maxIterations}) for ${name}")`;
  };

  let loopIndex = 0;
  const withLoopLimiters = withAsyncAwait.reduce<Line[]>((all, l) => {
    if (l.loop) {
      const varName = `${l.loop}_${loopIndex}`;
      const out: Line[] = [
        { ...l, line: `${varName} = 0`, sob: false },
        { ...l, line: `${l.line} # ${varName}` },
        { ...l, line: `if ${varName} >= ${maxIterations}:`, indent: l.indent + indents, sob: true },
        { ...l, line: maxIterError(varName), indent: l.indent + indents * 2, sob: false },
        { ...l, line: `${varName} = ${varName} + 1`, indent: l.indent + indents, sob: false },
      ];

      return [...all, ...out];
    }

    return [...all, l];
  }, []);

  const replaces = [
    ["print(", `${stdioOutput}(`],
    ["input(", `${stdioInput}(`],
  ];
  const withCustomSTDIO = withLoopLimiters.map((line) => {
    replaces.forEach(([from, to]) => {
      if (line.line.includes(from)) {
        line.line = line.line.replace(from, to);
      }
    });

    return line;
  });

  const functionCode = (i = 0) =>
    withCustomSTDIO.map((p) => `${space(p.indent + indents + i)}${p.line}`).join("\n");

  let body = `${functionCode(0)}
${space(indents)}return locals()`;

  // FIXME: HACK TO ADD mocked_print
  if (env === "browser") {
    body = body.replace(new RegExp(stdioOutput, "g"), "print_mock");
  }

  if (env === "tests") {
    body = `${space(indents)}try:
${functionCode(indents)}
${space(indents)}except KillProgram:
${space(indents * 2)}pass
${space(indents)}finally:
${space(indents * 2)}return locals()`;
  }

  const output = `
${shared}

${polyfills[env]({ input: stdioInput, print: stdioOutput })}

async def ${INTERNAL_FUNC_NAME_USER_CODE}():
${body}

${run[env]}`.trim();

  if (testData) {
    return output.replace("$__DATA__$", formatTestData(testData));
  }

  return output;
};
