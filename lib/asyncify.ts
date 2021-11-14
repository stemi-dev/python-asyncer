import { INTERNAL_FUNC_NAME_USER_CODE } from "./const";
import { space, cleanup, formatTestData } from "./utils";
import { GeneratedTest } from "./generateTest";
import { polyfills, shared, run } from "./templates";
import { Config, defaultConfig } from "./config";

export type AsyncifyENV = "native" | "browser" | "tests";

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

  console.log(finalConfig);

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

  const functionsToAwait = ["input"];
  parsed.forEach((line) => {
    if (line.sob) {
      if (line.line.startsWith("def")) {
        functionsToAwait.push(line.line.split(" ")[1].slice(0, -2));
      } else if (line.line.startsWith("async def")) {
        functionsToAwait.push(line.line.split(" ")[2].slice(0, -2));
      }
    }
  });

  const withAsyncAwait = parsed.map((line) => {
    // if is def of a function add async before
    if (line.line.startsWith("def") && line.sob) {
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

  const functionCode = withCustomSTDIO
    .map((p) => `${space(p.indent + indents)}${p.line}`)
    .join("\n");

  const output = `
${shared}
${polyfills[env]({ input: stdioInput, print: stdioOutput })}

async def ${INTERNAL_FUNC_NAME_USER_CODE}():
${functionCode}
${space(indents)}return locals()

${run[env]}`.trim();

  if (testData) {
    return output.replace("$__DATA__$", formatTestData(testData));
  }

  return output;
};
