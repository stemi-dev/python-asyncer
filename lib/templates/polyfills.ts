import { AsyncifyENV } from "../asyncify";

export const polyfills: Record<AsyncifyENV, ({ input, print }) => string> = {
  native: ({ input, print }) => `async def ${input}(prompt: str):
  return input(prompt)


async def ${print}(*args, **kwargs):
  print(*args, **kwargs)`,
  browser: () => ``,
  tests: ({ input, print }) => `
index = -1
$__DATA__$
outputs = []


async def ${input}(prompt: str):
    global index
    index += 1
    return inputs[index]


def ${print}(*args, **kwargs):
    outputs.append(args)`,
};
