import { GeneratedTest } from "./generateTest";

export const space = (n: number) => {
  return Array.from(new Array(n))
    .map(() => " ")
    .join("");
};

export const cleanup = (code: string) => {
  code = code
    .split("\n")
    .map((line, index) => `${line} #|LINE_NUM:${index + 1}|#`)
    .join("\n");

  code = code.replace(/\\n/g, "\\\\n");

  const tmp = code.split('"""');
  const out: string[] = [];
  for (let i = 0; i < tmp.length; i++) {
    if (i % 2 === 0) {
      out.push(tmp[i]);
    }
  }

  const lines = out
    .join("\n")
    .split("\n")
    .filter((a) => !a.startsWith("#"));

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
