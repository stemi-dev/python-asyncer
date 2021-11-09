import { AsyncifyENV } from "../asyncify";
import { STDIO_NAMES } from "../const";

export const globals: Record<AsyncifyENV, string> = {
  native: `async def ${STDIO_NAMES.input}(prompt: str):
  return input(prompt)


async def ${STDIO_NAMES.print}(*args, **kwargs):
  print(*args, **kwargs)`,
  browser: ``,
  tests: `
index = -1
$__DATA__$
outputs = []


async def ${STDIO_NAMES.input}(prompt: str):
    global index
    index += 1
    return inputs[index]


def ${STDIO_NAMES.print}(*args, **kwargs):
    outputs.append(args)`,
};
