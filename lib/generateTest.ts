export type GeneratedTest = {
  input: string[];
  output: string[];
  outputComments: string[];
  defined: Record<string, string>;
};

type Test = { in: string } | { out: string; description?: string };

export type TemplateTests = {
  variables: Record<string, string>;
  defined: GeneratedTest["defined"];
  test: Test[];
};

export const generateTest = (json: TemplateTests, faker: Faker.FakerStatic): GeneratedTest => {
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

  const isInput = (obj: Test): obj is { in: string } => {
    return (obj as any).in !== undefined;
  };

  const decorateWithVariables = (key: "in" | "out" | "description") => {
    return json.test
      .filter((item) => (key === "in" ? isInput(item) : !isInput(item)))
      .map((item) => {
        const val = item[key] as string | undefined;
        return val ? replaceWithString(val).toString() : null;
      });
  };

  return {
    input: decorateWithVariables("in"),
    output: decorateWithVariables("out"),
    outputComments: decorateWithVariables("description"),
    defined: Object.fromEntries(
      Object.entries(json["defined"]).map(([k, v]) => [k, replaceWithString(v)])
    ),
  };
};
