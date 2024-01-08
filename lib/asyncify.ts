import { INTERNAL_FUNC_NAME_USER_CODE } from "./const";
import { cleanup, formatTestData, space } from "./utils";
import { GeneratedTest } from "./generateTest";
import { polyfills, run, shared } from "./templates";
import { Config, defaultConfig } from "./config";
import modules from "./modules";

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
export const asyncify = (
  raw: string,
  config?: Partial<Config>,
  testData?: GeneratedTest
) => {
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
      loop: line.startsWith("for ")
        ? "for"
        : line.startsWith("while ")
        ? "while"
        : false,
      indent: indent?.length || 0,
    };
  });

  // TODO: check if it's valid python

  const isDunder = (line?: string) =>
    line && line.startsWith("__") && line.endsWith("__");

  const functionsToAwait = ["input(", "time.sleep("];
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

  const methodsToAwait = ["json"];

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
      line.line = line.line.replace(func, `await ${func}`);
      if (line.line.includes(func) && !line.sob) {
        if (line.line.includes(func)) {
          line.line.replace("))", ")))");
        }
        if (line.line.includes("time.sleep(")) {
          line.line = line.line.replace("time.sleep", "sleep");
        }
      }
    });

    methodsToAwait.forEach((func) => {
      const regex = new RegExp(`[a-zA-Z0-9s]+\.${func}\\(`);
      const r = line.line.match(regex);
      if (r) {
        line.line =
          line.line.slice(0, r.index! + r[0].length) +
          ")" +
          line.line.slice(r.index! + r[0].length);
        line.line =
          line.line.slice(0, r.index) + "await (" + line.line.slice(r.index);
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
        {
          ...l,
          line: `if ${varName} >= ${maxIterations}:`,
          indent: l.indent + indents,
          sob: true,
        },
        {
          ...l,
          line: maxIterError(varName),
          indent: l.indent + indents * 2,
          sob: false,
        },
        {
          ...l,
          line: `${varName} = ${varName} + 1`,
          indent: l.indent + indents,
          sob: false,
        },
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
        // Wrap await custom input
        if (line.line.includes("await")) {
          let closePosition = -1;
          let openCounter = 0;
          for (let c = 0; c < line.line.length; c += 1) {
            if (line.line[c] == "(") {
              openCounter += 1;
            } else if (line.line[c] == ")") {
              openCounter -= 1;
              if (openCounter == 0) {
                closePosition = c;
                break;
              }
            }
          }
          if (closePosition == -1) {
            return;
          }
          const awaitPosition = line.line.indexOf("await");
          line.line =
            line.line.substr(0, awaitPosition) +
            "(" +
            line.line.substr(awaitPosition);
          closePosition += 1;
          line.line =
            line.line.substr(0, closePosition) +
            ")" +
            line.line.substr(closePosition);
          console.log(line.line);
        }
      }
    });

    return line;
  });

  const functionCode = (i = 0) =>
    withCustomSTDIO
      .map((p) => `${space(p.indent + indents + i)}${p.line}`)
      .join("\n");

  let body = `${functionCode(0)}
${space(indents)}return locals()`;

  // FIXME: HACK TO ADD mocked_print
  if (env === "browser") {
    body = body.replace(new RegExp(stdioOutput, "g"), "print_mock");
  }

  if (env === "tests") {
    body = `${space(indents)}ex = None
${space(indents)}try:
${functionCode(indents)}
${space(indents)}except KillProgram:
${space(indents * 2)}pass
${space(indents)}except WrongNumberOfInputs as e:
${space(
  indents * 2
)}ex = "WRONG_NUMBER_OF_INPUTS: Wrong number of inputs: " + str(e.index)
${space(indents)}except Exception as e:
${space(indents * 2)}ex = traceback.format_exc()
${space(indents)}finally:
${space(indents * 2)}return locals(), ex`;
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
