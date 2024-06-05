var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key2, value2) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value: value2 }) : obj[key2] = value2;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// lib/index.ts
__export(exports, {
  DEFAULT_INDENTS: () => DEFAULT_INDENTS,
  INTERNAL_FUNC_NAME_USER_CODE: () => INTERNAL_FUNC_NAME_USER_CODE,
  MAIN_FUNCTION: () => MAIN_FUNCTION,
  STDIO_NAMES: () => STDIO_NAMES,
  asyncify: () => asyncify,
  cleanup: () => cleanup,
  generateTest: () => generateTest,
  getLineMapping: () => getLineMapping,
  mapTraceback: () => mapTraceback,
  tracebackFormatter: () => tracebackFormatter
});

// lib/const.ts
var DEFAULT_INDENTS = 4;
var STDIO_NAMES = {
  print: "custom_print",
  input: "custom_input"
};
var INTERNAL_FUNC_NAME_USER_CODE = "internal_func_name_user_code";
var MAIN_FUNCTION = "main";

// lib/modules/requests.ts
var requests_default = `
from pyodide.http import pyfetch

async def get(url):
    response = await pyfetch(url)
    response.status_code = response.status
    return response

`;

// lib/modules/index.ts
var modules_default = {
  requests: requests_default
};

// lib/utils.ts
var space = (n) => {
  return Array.from(new Array(n)).map(() => " ").join("");
};
var addCustomModules = (code) => {
  let lines = code.split("\n");
  const moduleNames = Object.keys(modules_default);
  moduleNames.forEach((moduleName) => {
    lines = lines.map((line) => {
      if (line.includes(`from ${moduleName} import`)) {
        line = modules_default[moduleName];
      }
      return line;
    });
  });
  const newCode = lines.join("\n");
  return newCode;
};
var cleanup = (code) => {
  code = addCustomModules(code);
  let funcRegex = new RegExp(/def .*\(/, "g");
  let funcs = code.match(funcRegex);
  if (funcs) {
    funcs = funcs.filter((el) => {
      return !el.includes(" async ");
    });
  }
  let func, funcName;
  code = code.split("\n").map((line, index) => `${line} #|LINE_NUM:${index + 1}|#`).join("\n");
  code = code.replace(/\\n/g, "\\\\n");
  const tmp = code.split("f'''").join("#JOIN#").split('f"""').join("#JOIN#").split('"""').join("#JOIN#").split("'''").join("#JOIN#").split("#JOIN#");
  let out = "";
  for (let i = 0; i < tmp.length; i++) {
    if (i % 2 === 0) {
      out += tmp[i];
    } else {
      tmp[i] = tmp[i].replaceAll(/#\|LINE_NUM:[0-9]+\|#/gi, "");
      tmp[i] = "f'''" + tmp[i] + "'''";
      out += tmp[i] + "\n";
    }
  }
  let lines = out.split("\n").filter((a) => !a.startsWith("#"));
  lines = lines.map((el) => el.includes("\\\\n") ? el.replaceAll("\\\\n", "\\n") : el);
  if (funcs)
    funcs.forEach((fnel) => {
      if (fnel) {
        const openIndex = fnel.indexOf("(");
        func = fnel.substr(0, openIndex);
        funcName = func.substr(4, openIndex);
        const re1 = new RegExp(func + "\\s*\\(");
        const re2 = new RegExp(funcName + "\\s*\\(");
        lines = lines.map((el) => el.match(re1) && !el.includes("async def") ? el.replaceAll(func, "async " + func) : el);
        lines = lines.map((el) => el.match(re2) && !el.match(re1) && !el.includes("async def") ? el.replaceAll(funcName, "await " + funcName) : el);
      }
    });
  if (process.env["asyncer_dev"] === "true") {
    return lines;
  }
  return lines.filter((a) => a.length > 0);
};
var formatTestData = (data) => {
  console.log(data);
  return `inputs = ${JSON.stringify(data.input)}
expected_definitions = ${JSON.stringify(data.defined)}
expected_outputs = ${JSON.stringify(data.output)}
expected_comments = ${JSON.stringify(data.outputComments.map((str2) => str2 === null ? "None" : str2))}`;
};

// lib/templates/polyfills.ts
var polyfills = {
  native: ({ input, print }) => `async def ${input}(prompt: str = None):
  return input(prompt)


def ${print}(*args, **kwargs):
  print(*args, **kwargs)`,
  browser: ({ print }) => `def print_mock(*args, **kwargs):
  outputs = []
  for arg in kwargs:
    if type(arg) == float and arg.is_integer():
      outputs.append(str(arg))
    else:
      outputs.append(arg)

  ${print}(*outputs, **kwargs)`,
  tests: ({ input, print }) => `
index = -1
$__DATA__$
outputs = []


class KillProgram(RuntimeError):
    pass


class WrongNumberOfInputs(RuntimeError):
    def __init__(self, index):
        self.index = index


async def ${input}(prompt: str = None):
    global index
    index += 1

    if index >= len(inputs):
        raise WrongNumberOfInputs(index)

    if inputs[index] == 'KILL_PROGRAM':
        raise KillProgram()

    return inputs[index]
    `
};
// def ${print}(*args, **kwargs):
//     outputs.append(args)`
// };

// lib/templates/run.ts
var run = {
  native: `def ${MAIN_FUNCTION}():
  loop = asyncio.get_event_loop()
  defines = loop.run_until_complete(${INTERNAL_FUNC_NAME_USER_CODE}())
  loop.close()`,
  browser: `async def ${MAIN_FUNCTION}():
  await ${INTERNAL_FUNC_NAME_USER_CODE}()`,
  tests: `class Result:
    def __init__(self, test_pass, test_type, comment=None, verbose=None, index=None):
        self.test_pass = test_pass
        self.type = test_type
        self.comment = comment
        self.verbose = verbose
        self.index = index

    def to_dict(self):
        return {"test_pass": self.test_pass, "type": self.type, "comment": self.comment, "verbose": self.verbose, "index": self.index}


async def ${MAIN_FUNCTION}():
    try:
        defines, exception = await ${INTERNAL_FUNC_NAME_USER_CODE}()
        if exception:
            return json.dumps({"error": exception})
    except Exception as e:
        return json.dumps({"error": str(e)})

    results = []
    for key in expected_definitions:
        if key not in defines:
            results.append(Result(False, 'defined', f"variable '{key}' not found"))
        elif defines[key] != expected_definitions[key]:
            comment = f"variable '{key}' not expected value, found: {defines[key]}, expected: {expected_definitions[key]}"
            results.append(Result(False, 'defined', comment))
        else:
            results.append(Result(True, 'defined', key))

    if len(outputs) < len(expected_outputs):
        results.append(Result(False, 'number_of_prints', f'You had {len(outputs)} print{"" if len(outputs) == 1 else "s"}, but this test expected you to have {len(expected_outputs)} print{"" if len(expected_outputs) == 1 else "s"}', verbose=[outputs, expected_outputs]))
    else:
        results.append(Result(True, 'number_of_prints', 'Correct number of prints'))

        for i in range(len(expected_outputs)):
            a = " ".join(map(lambda x: str(x), list(outputs[i])))
            b = expected_outputs[i]
            c = expected_comments[i]

            if b.startswith('/') and b.endswith('/'):
                match = re.match(b[1:-1], a, re.DOTALL)
                if match is None:
                    comment = c or f'REGEX "{a}" does not match "{b}"'
                    if comment == c:
                        comment = f'{comment}, [Your output was: "{a}"]'

                    results.append(Result(False, 'match', f'index[{i}]: {comment}', index=i))
                else:
                    results.append(Result(True, 'match', f'index[{i}]: Correct, [Your output was: "{a}"]', index=i))
            elif a != b:
                comment = c or 'We expected to see "{b}" and you printed "{a}"'
                results.append(Result(False, 'match', f'index[{i}]: {comment}', index=i))
            else:
                results.append(Result(True, 'match', f'index[{i}]: Correct, [Your output was: "{a}"]', index=i))

    return json.dumps(list(map(lambda x: x.to_dict(), results)))`
};

// lib/templates/index.ts
var shared = `import json
import re
import traceback`;

// lib/config.ts
var MAX_ITERATIONS = 1e3;
var defaultConfig = {
  env: "native",
  indents: DEFAULT_INDENTS,
  maxIterations: MAX_ITERATIONS,
  stdioInput: STDIO_NAMES.input,
  stdioOutput: STDIO_NAMES.print
};

// lib/asyncify.ts
var isDev = process.env["asyncer_dev"] === "true";
var asyncify = (raw, config, testData) => {
  if (raw.includes(INTERNAL_FUNC_NAME_USER_CODE)) {
    throw new Error(`User code can't contain ${INTERNAL_FUNC_NAME_USER_CODE}`);
  }
  const finalConfig = __spreadValues(__spreadValues({}, defaultConfig), config);
  const { env, indents, maxIterations, stdioInput, stdioOutput } = finalConfig;
  if (isDev) {
    console.log(finalConfig);
  }
  const lines = cleanup(raw);
  const parsed = lines.map((line) => {
    var _a;
    const indent = (_a = line.match(/^\s*/)) == null ? void 0 : _a[0];
    return {
      line: line.slice((indent == null ? void 0 : indent.length) || 0),
      sob: line.endsWith(":"),
      loop: line.startsWith("for ") ? "for" : line.startsWith("while ") ? "while" : false,
      indent: (indent == null ? void 0 : indent.length) || 0
    };
  });
  const isDunder = (line) => line && line.startsWith("__") && line.endsWith("__");
  const functionsToAwait = ["input(", "time.sleep("];
  parsed.forEach((line) => {
    var _a, _b;
    if (line.sob) {
      let methodName;
      if (line.line.startsWith("def")) {
        methodName = (_a = line.line.match(/^\s*def\s+(\w+)/)) == null ? void 0 : _a[1];
      } else if (line.line.startsWith("async def")) {
        methodName = (_b = line.line.match(/^\s*async def\s+(\w+)/)) == null ? void 0 : _b[1];
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
    var _a;
    if (line.line.startsWith("def") && line.sob && !isDunder((_a = line.line.match(/^\s*def\s+(\w+)/)) == null ? void 0 : _a[1])) {
      return __spreadProps(__spreadValues({}, line), {
        line: `async ${line.line}`
      });
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
      const regex = new RegExp(`[a-zA-Z0-9s]+.${func}\\(`);
      const r = line.line.match(regex);
      if (r) {
        line.line = line.line.slice(0, r.index + r[0].length) + ")" + line.line.slice(r.index + r[0].length);
        line.line = line.line.slice(0, r.index) + "await (" + line.line.slice(r.index);
      }
    });
    return line;
  });
  const maxIterError = (name) => {
    return `raise RuntimeError(f"Max number of iterations exceeded (${maxIterations}) for ${name}")`;
  };
  let loopIndex = 0;
  const withLoopLimiters = withAsyncAwait.reduce((all, l) => {
    if (l.loop) {
      const varName = `${l.loop}_${loopIndex}`;
      const out = [
        __spreadProps(__spreadValues({}, l), { line: `${varName} = 0`, sob: false }),
        __spreadProps(__spreadValues({}, l), { line: `${l.line} # ${varName}` }),
        __spreadProps(__spreadValues({}, l), {
          line: `if ${varName} >= ${maxIterations}:`,
          indent: l.indent + indents,
          sob: true
        }),
        __spreadProps(__spreadValues({}, l), {
          line: maxIterError(varName),
          indent: l.indent + indents * 2,
          sob: false
        }),
        __spreadProps(__spreadValues({}, l), {
          line: `${varName} = ${varName} + 1`,
          indent: l.indent + indents,
          sob: false
        })
      ];
      return [...all, ...out];
    }
    return [...all, l];
  }, []);
  const replaces = [
    [RegExp("print\\s*\\("), `${stdioOutput}(`],
    [RegExp("input\\s*\\("), `${stdioInput}(`]
  ];
  const withCustomSTDIO = withLoopLimiters.map((line) => {
    replaces.forEach(([from, to]) => {
      if (line.line.match(from)) {
        line.line = line.line.replace(from, to);
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
          line.line = line.line.substr(0, awaitPosition) + "(" + line.line.substr(awaitPosition);
          closePosition += 1;
          line.line = line.line.substr(0, closePosition) + ")" + line.line.substr(closePosition);
        }
      }
    });
    return line;
  });
  const functionCode = (i = 0) => withCustomSTDIO.map((p) => `${space(p.indent + indents + i)}${p.line}`).join("\n");
  let body = `${functionCode(0)}
${space(indents)}return locals()`;
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
${space(indents * 2)}ex = "WRONG_NUMBER_OF_INPUTS: Wrong number of inputs: " + str(e.index)
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

// lib/generateTest.ts
var generateTest = (json, faker, endWithKill) => {
  const variables = Object.entries(json["variables"]).map(([key, value]) => {
    if (value.startsWith("faker.")) {
      return { key, value: eval(value).toString() };
    }
    return { key, value };
  });
  const replaceWithString = (str) => {
    variables.forEach((variable) => {
      str = str.replace(new RegExp(`\\$${variable.key}`, "g"), variable.value);
    });
    if (str.match(/calc(.*)/)) {
      return eval(str.slice(5, -1));
    }
    return str;
  };
  const isInput = (obj) => {
    return obj.in !== void 0;
  };
  const decorateWithVariables = (key2) => {
    return json.test.filter((item) => key2 === "in" ? isInput(item) : !isInput(item)).map((item) => {
      const val = item[key2];
      return val ? replaceWithString(val).toString() : null;
    });
  };
  return {
    input: [...decorateWithVariables("in"), ...endWithKill ? ["KILL_PROGRAM"] : []],
    output: decorateWithVariables("out"),
    outputComments: decorateWithVariables("description"),
    defined: Object.fromEntries(Object.entries(json["defined"]).map(([k, v]) => [k, replaceWithString(v)]))
  };
};

// lib/helpers/traceback.ts
var getLineMapping = (asyncifiedCode) => {
  return Object.fromEntries(asyncifiedCode.split("\n").map((line, index) => [index, line.match(/#\|LINE_NUM:\d*\|#/)]).filter(([, match]) => !!match).map(([index, match]) => [index, match ? match[0] : ""]).map(([index, match]) => [index, parseInt(match.match(/\d+/))]));
};
var mapTraceback = (traceback, asyncifiedCode) => {
  const lineMapping = getLineMapping(asyncifiedCode);
  const mappedLines = traceback.split("\n").map((line) => {
    if (!line.match(/File "<exec>"/)) {
      return line;
    }
    const m = line.match(/line \d+,/g);
    if (m) {
      const lineNum = parseInt(m[0].match(/\d+/));
      const mappedLine = lineMapping[lineNum];
      if (mappedLine) {
        return line.replace(m[0], `line ${mappedLine},`);
      }
      if (line.match(INTERNAL_FUNC_NAME_USER_CODE)) {
        return line.replace(m[0], `line 0,`);
      }
    }
    return line;
  });
  return mappedLines.join("\n");
};
var tracebackFormatter = (traceback, asyncifiedCode, stdio) => {
  let output = mapTraceback(traceback, asyncifiedCode);
  output = output.replace(new RegExp(stdio.stdioInput, "g"), "input(");
  output = output.replace(new RegExp(stdio.stdioOutput, "g"), "print(");
  output = output.replace(new RegExp(INTERNAL_FUNC_NAME_USER_CODE, "g"), "main");
  return output;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_INDENTS,
  INTERNAL_FUNC_NAME_USER_CODE,
  MAIN_FUNCTION,
  STDIO_NAMES,
  asyncify,
  cleanup,
  generateTest,
  getLineMapping,
  mapTraceback,
  tracebackFormatter
});
