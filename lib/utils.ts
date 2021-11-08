import { GeneratedTest } from "./generateTest";

export const space = (n: number) => {
  return Array.from(new Array(n))
    .map(() => " ")
    .join("");
};

export const cleanup = (code: string) => {
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
    .filter((a) => !a.startsWith("#"))
    .filter((a) => a.length > 0);

  return lines;
};

export const formatTestData = (data: GeneratedTest) => {
  return `inputs = ${JSON.stringify(data.input)}
expected_definitions = ${JSON.stringify(data.defined)}
expected_outputs = ${JSON.stringify(data.output)}`;
};
