import json
import re


index = -1
inputs = ["Gayle","a"]
expected_definitions = {"imeOsobe":"Gayle"}
expected_outputs = ["Bok!","/.*Gayle.*/","/a\\..*/","/b\\..*/","/.*: a/","/.*/","/\\[.*,.*\\]/"]
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
        popisPizza = ['1. Margherita(rajčica,sir)','2. Funghi(rajčica,sir,funghi)']
        custom_print('Bok!')
        imeOsobe = await custom_input('Ja sam PizzaBot. Kako se zoveš?' )
        custom_print('Drago mi je ' + imeOsobe + '. Što želiš napraviti dalje:')
        while_0 = 0
        while True: # while_0
            if while_0 >= 1000:
                raise RuntimeError(f"Max number of iterations exceeded (1000) for while_0")
            while_0 = while_0 + 1
            custom_print('a. Pokaži pizzu')
            custom_print('b. Naruči pizzu')
            izbor = await custom_input('Odaberi jednu od ponuđenih opcija: ')
            if izbor == 'a':
                custom_print('Odabrao si opciju: ' + izbor)
                custom_print('Podnuđene pizze su: ')
                custom_print(popisPizza)
            elif izbor == 'b':
                custom_print('Odabrao si opciju: ' + izbor + ' \\n')
                custom_print('Podnuđene pizze su: ')
                custom_print(popisPizza)
                izborPizze = await custom_input('Koju pizzu' + imeOsobe + 'želiš naručiti? ')
                if izborPizze == '1':
                    custom_print('Tvoj izbor je Margherita')
                    custom_print('Tvoj izbor je '+ popisPizza[0])
                elif izborPizze == '2':
                    custom_print('Tvoj izbor je Funghi')
                    custom_print('Tvoj izbor je '+ popisPizza[1])
                else:
                    custom_print('Na žalost taj izbor nemamo u našem menu')
            else:
                custom_print('Došlo je do nesporazuma, nisi odabrao niti jednu ponuđenu opciju.')
                custom_print('Molim te odaberi ponovno\\n')
            break
                
    except KillProgram:
        pass
    except Exception as e:
        ex = e
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
            return {"error": str(exception)}
    except Exception as e:
        return {"error": str(e)}

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