import json
import re
import traceback


index = -1
inputs = ["Eloy","a"]
expected_definitions = {"imeOsobe":"Eloy"}
expected_outputs = ["Bok!","/.*Eloy.*/","/a\\..*/","/b\\..*/","/.*: a/","/.*/","/\\[.*,.*\\]/"]
expected_comments = ["None","None","None","None","None","None","None"]
outputs = []


class KillProgram(RuntimeError):
    pass


async def custom_input(prompt: str = None):
    global index
    index += 1

    if inputs[index] == 'KILL_PROGRAM':
        raise KillProgram()

    return inputs[index]


def custom_print(*args, **kwargs):
    outputs.append(args)

async def internal_func_name_user_code():
    ex = None
    try:
         #|LINE_NUM:6|#
        popisPizza = ['1. Margherita(rajčica,sir)','2. Funghi(rajčica,sir,funghi)'] #|LINE_NUM:7|#
        custom_print('Bok!') #|LINE_NUM:8|#
        imeOsobe = await custom_input('Ja sam PizzaBot. Kako se zoveš?' ) #|LINE_NUM:9|#
        custom_print('Drago mi je ' + imeOsobe + '. Što želiš napraviti dalje:') #|LINE_NUM:10|#
        while_0 = 0
        while True: #|LINE_NUM:11|# # while_0
            if while_0 >= 1000:
                raise RuntimeError(f"Max number of iterations exceeded (1000) for while_0")
            while_0 = while_0 + 1
            custom_print('a. Pokaži pizzu') #|LINE_NUM:12|#
            custom_print('b. Naruči pizzu') #|LINE_NUM:13|#
            izbor = await custom_input('Odaberi jednu od ponuđenih opcija: ') #|LINE_NUM:14|#
            if izbor == 'a': #|LINE_NUM:15|#
                custom_print('Odabrao si opciju: ' + izbor) #|LINE_NUM:16|#
                custom_print('Podnuđene pizze su: ') #|LINE_NUM:17|#
                custom_print(popisPizza) #|LINE_NUM:18|#
            elif izbor == 'b': #|LINE_NUM:19|#
                custom_print('Odabrao si opciju: ' + izbor + ' \\n') #|LINE_NUM:20|#
                custom_print('Podnuđene pizze su: ') #|LINE_NUM:21|#
                custom_print(popisPizza) #|LINE_NUM:22|#
                izborPizze = await custom_input('Koju pizzu' + imeOsobe + 'želiš naručiti? ') #|LINE_NUM:23|#
                if izborPizze == '1': #|LINE_NUM:24|#
                    custom_print('Tvoj izbor je Margherita') #|LINE_NUM:25|#
                    custom_print('Tvoj izbor je '+ popisPizza[0]) #|LINE_NUM:26|#
                elif izborPizze == '2': #|LINE_NUM:27|#
                    custom_print('Tvoj izbor je Funghi') #|LINE_NUM:28|#
                    custom_print('Tvoj izbor je '+ popisPizza[1]) #|LINE_NUM:29|#
                else: #|LINE_NUM:30|#
                    custom_print('Na žalost taj izbor nemamo u našem menu') #|LINE_NUM:31|#
            else: #|LINE_NUM:32|#
                custom_print('Došlo je do nesporazuma, nisi odabrao niti jednu ponuđenu opciju.') #|LINE_NUM:33|#
                custom_print('Molim te odaberi ponovno\\n') #|LINE_NUM:34|#
            break #|LINE_NUM:35|#
                 #|LINE_NUM:36|#
    except KillProgram:
        pass
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
                match = re.match(b[1:-1], a)
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