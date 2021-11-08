/**
 * @param {number} n
 */
const space = (n) =>
  Array.from(new Array(n))
    .map(() => " ")
    .join("");

/**
 * @param {string} code
 */
const cleanup = (code) => {
  const tmp = code.split('"""');
  const out = [];
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

/**
 * @param {{input: string[], output: string[], defined: Record<string, string>}} data
 * @returns
 */
const formatTestData = (data) => {
  return `inputs = ${JSON.stringify(data.input)}
expected_definitions = ${JSON.stringify(data.defined)}
expected_outputs = ${JSON.stringify(data.output)}`;
};

module.exports = {
  space,
  cleanup,
  formatTestData,
};
