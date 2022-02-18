import { Config } from "../config";
import { INTERNAL_FUNC_NAME_USER_CODE } from "../const";

export const getLineMapping = (asyncifiedCode: string) => {
  return Object.fromEntries(
    asyncifiedCode
      .split("\n")
      .map((line, index) => [index, line.match(/#\|LINE_NUM:\d*\|#/)] as const)
      .filter(([, match]) => !!match)
      .map(([index, match]) => [index, match ? match[0] : ""] as const)
      .map(([index, match]) => [index, parseInt(match.match(/\d+/) as any)])
  );
};

export const mapTraceback = (traceback: string, asyncifiedCode: string) => {
  const lineMapping = getLineMapping(asyncifiedCode);
  const mappedLines = traceback.split("\n").map((line) => {
    const m = line.match(/line \d+,/g);
    if (m) {
      const lineNum = parseInt(m[0].match(/\d+/) as any);
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

export const tracebackFormatter = (
  traceback: string,
  asyncifiedCode: string,
  stdio: Pick<Config, "stdioInput" | "stdioOutput">
) => {
  let output = mapTraceback(traceback, asyncifiedCode);
  output = output.replace(new RegExp(stdio.stdioInput, "g"), "input");
  output = output.replace(new RegExp(stdio.stdioOutput, "g"), "print");
  output = output.replace(new RegExp(INTERNAL_FUNC_NAME_USER_CODE, "g"), "main");

  return output;
};
