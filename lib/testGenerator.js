/**
 * @param {Record<string, any>} json
 */
const formatInput = (json, faker) => {
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

  const decorateWithVariables = (data, key) => {
    return data[key].map((item) => replaceWithString(item).toString());
  };

  return {
    input: decorateWithVariables(json, "inputs"),
    output: decorateWithVariables(json, "outputs"),
    defined: Object.fromEntries(
      Object.entries(json["defined"]).map(([k, v]) => [k, replaceWithString(v)])
    ),
  };
};

module.exports = formatInput;
