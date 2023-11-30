import { GeneratedTest } from "./generateTest";

export const space = (n: number) => {
  return Array.from(new Array(n))
    .map(() => " ")
    .join("");
};

export const cleanup = (code: string) => {

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
  
  for (let x=0; x<lines.length; x++){
      if (lines[x].includes("\\\\n")) {
      lines[x] = lines[x].replace("\\\\n", "\\n");
    }    
  };

  lines = lines
          .forEach((l) => l.includes("\\\\n") ? l.replace("\\\\n", "\\n"));

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
