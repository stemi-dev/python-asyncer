import { GeneratedTest } from "./generateTest";
import modules from "./modules";

export const space = (n: number) => {
  return Array.from(new Array(n))
    .map(() => " ")
    .join("");
};

export const addCustomModules = (code: string) => {

  let lines = code.split("\n");

  const moduleNames = Object.keys(modules);
  moduleNames.forEach((moduleName) => {
    lines = lines.map((line) => {
      if (line.includes(`from ${moduleName} import`)) {
        line = modules[moduleName];
      }
      return line;
    });
  });

  const newCode = lines.join("\n");
  return newCode;
}

export const cleanup = (code: string) => {
  code = addCustomModules(code);
  let funcRegex = new RegExp(/def .*\(/, 'g');
  let funcs = code.match(funcRegex);
  if (funcs) {
    funcs = funcs.filter((el) => {return !el.includes(" async ")});
  }
  let func,funcName;

  code = code.split("\n").map((line, index) => `${line} #|LINE_NUM:${index + 1}|#`).join("\n");
  code = code.replace(/\\n/g, "\\\\n");
  const tmp = code.split("f'''").join('#JOIN#').split('f"""').join("#JOIN#").split('"""').join('#JOIN#').split("'''").join('#JOIN#').split('#JOIN#');

  let out = "";
  for (let i = 0; i < tmp.length; i++) {
    if (i % 2 === 0) {
      out += tmp[i]
    } else {
      tmp[i] = (tmp[i] as any).replaceAll(/#\|LINE_NUM:[0-9]+\|#/gi, "");
      tmp[i] = "f'''" + tmp[i] + "'''";
      out += tmp[i] + "\n"
    }
  }


  let lines = out
    .split("\n")
    .filter((a) => !a.startsWith("#"));
  
    lines = lines.map((el) => el.includes("\\\\n") ? (el as any).replaceAll("\\\\n", "\\n") : el);
    
  if (funcs) funcs.forEach((fnel) => {
    if (fnel) {
      // func je ime funkcije sa def ( def foobar( ), funcName je samo ime funkcije
      const openIndex = fnel.indexOf("(")
      func = fnel.substr(0, openIndex);
      funcName = func.substr(4, openIndex);

      const re1 = new RegExp(func + '\\s*' + "\\(")
      const re2 = new RegExp(funcName + '\\s*' + "\\(")
      
      // prolazi sve cleanup-ane linije, ako nemaju async def i sadrze definicju funkcije ili ime funkcije mijenjamo sa await/async
      lines = lines.map((el) => (el.match(re1) && !el.includes("async def")) ? (el as any).replaceAll(func, "async " + func) : el);
      lines = lines.map((el) => (el.match(re2) && !el.match(re1) && !el.includes("async def")) ? (el as any).replaceAll(funcName, "await " + funcName) : el);
    }
  });

  if (process.env["asyncer_dev"] === "true") {
    return lines;
  }

  return lines.filter((a) => a.length > 0);
};

export const formatTestData = (data: GeneratedTest) => {
  console.log(data);

  return `inputs = ${JSON.stringify(data.input)}
expected_definitions = ${JSON.stringify(data.defined)}
expected_outputs = ${JSON.stringify(data.output)}
expected_comments = ${JSON.stringify(
    data.outputComments.map((str) => (str === null ? "None" : str))
  )}`;
};
