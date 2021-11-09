import { AsyncifyENV } from "../asyncify";

export const globals: Record<AsyncifyENV, string> = {
  native: `async def custom_input(prompt: str):
  return input(prompt)


async def custom_print(*args, **kwargs):
  print(*args, **kwargs)`,
  browser: ``,
  tests: `
index = -1
$__DATA__$
outputs = []


async def custom_input(prompt: str):
    global index
    index += 1
    return inputs[index]


def custom_print(*args, **kwargs):
    outputs.append(args)`,
};
