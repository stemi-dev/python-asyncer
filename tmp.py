import json
import re

index = -1
inputs = ["40", "36", "25", "Josie"]
expected_definitions = {"name": "Josie", "c": 76, "c2": 1440}
expected_outputs = ["76", "76", "76",
                    "Your age is: 25", "Hello Josie", "/\\w+ Josie/"]
outputs = []


class KillProgram(RuntimeError):
    pass


async def custom_input(prompt: str):
    global index
    index += 1

    if inputs[index] == 'KILL_PROGRAM':
        raise KillProgram()

    return inputs[index]


def custom_print(*args, **kwargs):
    outputs.append(args)


async def internal_func_name_user_code():
    try:
        async def pero():
            age = int(await custom_input("Enter your age: "))
            custom_print("Your age is:", age)  # + 1)
        a = int(await custom_input('a'))
        b = int(await custom_input('b'))
        c = a + b
        c2 = a * b
        for_0 = 0
        for i in range(3):  # for_0
            if for_0 >= 1000:
                raise RuntimeError(
                    f"Max number of iterations exceeded (1000) for for_0")
            for_0 = for_0 + 1
            custom_print(a + b)
        if 1 == 2:
            for k in range(10):
                custom_print('foo')
        await pero()
        name = await custom_input('name')  # + '1'
        custom_print(f"Hello {name}")
        custom_print(f"Bok {name}")
        a = await custom_input('command')
        while_0 = 0
        while a != 'exit':  # while_0
            if while_0 >= 1000:
                raise RuntimeError(
                    f"Max number of iterations exceeded (1000) for while_0")
            while_0 = while_0 + 1
            custom_print('Wrong command')
            a = await custom_input('command')
    except KillProgram:
        pass
    finally:
        return locals()


class Result:
    def __init__(self, test_pass, test_type, comment=None, verbose=None, index=None):
        self.test_pass = test_pass
        self.type = test_type
        self.comment = comment
        self.verbose = verbose
        self.index = index

    def to_dict(self):
        return {"test_pass": self.test_pass, "type": self.type, "comment": self.comment, "verbose": self.verbose, "index": self.index}


async def main():
    try:
        defines = await internal_func_name_user_code()
    except Exception as e:
        return {"error": str(e)}

    results = []
    for key in expected_definitions:
        if key not in defines:
            results.append(
                Result(False, 'defined', f"variable {key} not found"))
        elif defines[key] != expected_definitions[key]:
            comment = f"variable {key} not expected value, found: {defines[key]}, expected: {expected_definitions[key]}"
            results.append(Result(False, 'defined', comment))
        else:
            results.append(Result(True, 'defined', key))

    if len(outputs) != len(expected_outputs):
        results.append(Result(False, 'number_of_prints',
                       f'found: {len(outputs)}, expected: {len(expected_outputs)}', verbose=[outputs, expected_outputs]))
    else:
        results.append(Result(True, 'number_of_prints',
                       'Correct number of prints'))

        for i in range(len(outputs)):
            a = " ".join(map(lambda x: str(x), list(outputs[i])))
            b = expected_outputs[i]

            if b.startswith('/') and b.endswith('/'):
                match = re.match(b[1:-1], a)
                if match is None:
                    results.append(Result(
                        False, 'match', f'index[{i}]: REGEX "{a}" does not match "{b}"', index=i))
                else:
                    results.append(
                        Result(True, 'match', f'index[{i}]: "{a}" is correct', index=i))
            elif a != b:
                results.append(
                    Result(False, 'match', f'index[{i}]: "{a}" does not match "{b}"', index=i))
            else:
                results.append(
                    Result(True, 'match', f'index[{i}]: "{a}" is correct', index=i))

    return json.dumps(list(map(lambda x: x.to_dict(), results)))
