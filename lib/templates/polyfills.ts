import { AsyncifyENV } from "../asyncify";

export const polyfills: Record<AsyncifyENV, ({ input, print }) => string> = {
  native: ({ input, print }) => `async def ${input}(prompt: str = None):
  return input(prompt)


def ${print}(*args, **kwargs):
  print(*args, **kwargs)`,
  browser: ({ print }) => `def print_mock(*args, **kwargs):
  outputs = []
  for arg in args:
    if type(arg) == float and arg.is_integer():
      outputs.append(str(arg))
    else:
      outputs.append(arg)

  ${print}(*outputs, **kwargs)`,
  tests: ({ input, print }) => `
index = -1
$__DATA__$
outputs = []


class KillProgram(RuntimeError):
    pass


class WrongNumberOfInputs(RuntimeError):
    def __init__(self, index):
        self.index = index


async def ${input}(prompt: str = None):
    global index
    index += 1

    if index >= len(inputs):
        raise WrongNumberOfInputs(index)

    if inputs[index] == 'KILL_PROGRAM':
        raise KillProgram()

    return inputs[index]


def ${print}(*args, **kwargs):
    outputs.append(args)`,
};
