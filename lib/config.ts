import { DEFAULT_INDENTS } from "./const";
import { AsyncifyENV } from "./asyncify";

const MAX_ITERATIONS = 1000;
export type Config = {
  env: AsyncifyENV;
  indents: number;
  maxIterations: number;
};

export const defaultConfig: Config = {
  env: "native",
  indents: DEFAULT_INDENTS,
  maxIterations: MAX_ITERATIONS,
};
