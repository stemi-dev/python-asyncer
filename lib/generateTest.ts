export type GeneratedTest = {
  input: string[];
  output: string[];
  defined: Record<string, string>;
};

export type TemplateTests = GeneratedTest & { variables: Record<string, string> };

export const generateTest = (json: TemplateTests, faker: unknown): GeneratedTest => {
  const variables = Object.entries(json["variables"]).map(([key, value]) => {
    if (value.startsWith("faker.")) {
      return { key, value: eval(value).toString() };
    }

    return { key, value };
  });

  const replaceWithString = (str: string) => {
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
    input: decorateWithVariables(json, "input"),
    output: decorateWithVariables(json, "output"),
    defined: Object.fromEntries(
      Object.entries(json["defined"]).map(([k, v]) => [k, replaceWithString(v)])
    ),
  };
};
