import { DEFAULT_INDENTS, STDIO_NAMES } from "./const";
import { AsyncifyENV } from "./asyncify";

const MAX_ITERATIONS = 1000;
export type Config = {
  env: AsyncifyENV;
  indents: number;
  maxIterations: number;
  stdioInput: string;
  stdioOutput: string;
};

export const defaultConfig: Config = {
  env: "native",
  indents: DEFAULT_INDENTS,
  maxIterations: MAX_ITERATIONS,
  stdioInput: STDIO_NAMES.input,
  stdioOutput: STDIO_NAMES.print,
};
