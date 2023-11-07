import json
import re
import traceback


index = -1
inputs = ["78","14","28","Hassan"]
expected_definitions = {"name":"Hassan","c":92,"c2":1092}
expected_outputs = ["92","92","92","Your age is: 28","Hello Hassan","/\\w+ Hassan/"]
expected_comments = ["None","None","None","None","None","None"]
outputs = []


class KillProgram(RuntimeError):
    pass


class WrongNumberOfInputs(RuntimeError):
    def __init__(self, index):
        self.index = index


async def custom_input(prompt: str = None):
    global index
    index += 1

    if index >= len(inputs):
        raise WrongNumberOfInputs(index)

    if inputs[index] == 'KILL_PROGRAM':
        raise KillProgram()

    return inputs[index]


def custom_print(*args, **kwargs):
    outputs.append(args)

async def internal_func_name_user_code():
    ex = None
    try:
         #|LINE_NUM:3|#
         #|LINE_NUM:4|#
         #|LINE_NUM:5|#
        async def pero(): #|LINE_NUM:6|#
            age = int(await custom_input("Enter your age: ")) #|LINE_NUM:7|#
            custom_print("Your age is:", age)  # + 1) #|LINE_NUM:8|#
         #|LINE_NUM:9|#
         #|LINE_NUM:10|#
        a = int(await custom_input('a')) #|LINE_NUM:11|#
        b = int(await custom_input('b')) #|LINE_NUM:12|#
         #|LINE_NUM:13|#
        c = a + b #|LINE_NUM:14|#
        c2 = a * b #|LINE_NUM:15|#
         #|LINE_NUM:16|#
        for_0 = 0
        for i in range(3): #|LINE_NUM:17|#
            if for_0 >= 1000:
                raise RuntimeError(f"Max number of iterations exceeded (1000) for for_0")
            for_0 = for_0 + 1
            custom_print(a + b) #|LINE_NUM:18|#
         #|LINE_NUM:19|#
        if 1 == 2: #|LINE_NUM:20|#
            for k in range(10): #|LINE_NUM:21|#
                custom_print('foo') #|LINE_NUM:22|#
         #|LINE_NUM:23|#
        pero() #|LINE_NUM:24|#
         #|LINE_NUM:25|#
        name = await custom_input('name')  # + '1' #|LINE_NUM:26|#
        custom_print(f"Hello {name}") #|LINE_NUM:27|#
        custom_print(f"Bok {name}") #|LINE_NUM:28|#
         #|LINE_NUM:29|#
        a = await custom_input('command') #|LINE_NUM:30|#
        while_0 = 0
        while a != 'exit': #|LINE_NUM:31|# # while_0
            if while_0 >= 1000:
                raise RuntimeError(f"Max number of iterations exceeded (1000) for while_0")
            while_0 = while_0 + 1
            custom_print('Wrong command') #|LINE_NUM:32|#
            a = await custom_input('command') #|LINE_NUM:33|#
         #|LINE_NUM:34|#
    except KillProgram:
        pass
    except WrongNumberOfInputs as e:
        ex = "WRONG_NUMBER_OF_INPUTS: Wrong number of inputs: " + str(e.index)
    except Exception as e:
        ex = traceback.format_exc()
    finally:
        return locals(), ex

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
        defines, exception = await internal_func_name_user_code()
        if exception:
            return json.dumps({"error": exception})
    except Exception as e:
        return json.dumps({"error": str(e)})

    results = []
    for key in expected_definitions:
        if key not in defines:
            results.append(Result(False, 'defined', f"variable '{key}' not found"))
        elif defines[key] != expected_definitions[key]:
            comment = f"variable '{key}' not expected value, found: {defines[key]}, expected: {expected_definitions[key]}"
            results.append(Result(False, 'defined', comment))
        else:
            results.append(Result(True, 'defined', key))

    if len(outputs) != len(expected_outputs):
        results.append(Result(False, 'number_of_prints', f'You had {len(outputs)} print{"" if len(outputs) == 1 else "s"}, but this test expected you to have {len(expected_outputs)} print{"" if len(expected_outputs) == 1 else "s"}', verbose=[outputs, expected_outputs]))
    else:
        results.append(Result(True, 'number_of_prints', 'Correct number of prints'))

        for i in range(len(outputs)):
            a = " ".join(map(lambda x: str(x), list(outputs[i])))
            b = expected_outputs[i]
            c = expected_comments[i]

            if b.startswith('/') and b.endswith('/'):
                match = re.match(b[1:-1], a, re.DOTALL)
                if match is None:
                    comment = c or f'REGEX "{a}" does not match "{b}"'
                    if comment == c:
                        comment = f'{comment}, [Your output was: "{a}"]'

                    results.append(Result(False, 'match', f'index[{i}]: {comment}', index=i))
                else:
                    results.append(Result(True, 'match', f'index[{i}]: Correct, [Your output was: "{a}"]', index=i))
            elif a != b:
                comment = c or 'We expected to see "{b}" and you printed "{a}"'
                results.append(Result(False, 'match', f'index[{i}]: {comment}', index=i))
            else:
                results.append(Result(True, 'match', f'index[{i}]: Correct, [Your output was: "{a}"]', index=i))

    return json.dumps(list(map(lambda x: x.to_dict(), results)))