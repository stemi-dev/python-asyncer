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
