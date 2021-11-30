import asyncio
import json
import re

index = -1
inputs = ["Royal", "c", "KILL_PROGRAM"]
expected_definitions = {"imeOsobe": "Royal"}
expected_outputs = ["Bok!", "Drago mi je Royal. Što želiš napraviti dalje:",
                    "/a\\..*/", "/b\\..*/", "/.*/", "/.*/", "/a\\..*/", "/b\\..*/"]
outputs = []


class KillProgram(RuntimeError):
    pass


async def test_input(prompt: str):
    global index
    index += 1

    if inputs[index] == 'KILL_PROGRAM':
        raise KillProgram()

    return inputs[index]


def test_print(*args, **kwargs):
    outputs.append(args)


async def internal_func_name_user_code():
    try:
        popisPizza = ['1. Margherita(rajčica,sir)',
                      '2. Funghi(rajčica,sir,funghi)']
        test_print('Bok!')
        imeOsobe = await test_input('Ja sam PizzaBot. Kako se zoveš?')
        test_print('Drago mi je ' + imeOsobe + '. Što želiš napraviti dalje:')
        while_0 = 0
        while True:  # while_0
            if while_0 >= 3:
                raise RuntimeError(
                    f"Max number of iterations exceeded (3) for while_0")
            while_0 = while_0 + 1
            test_print('a. Pokaži pizzu')
            test_print('b. Naruči pizzu')
            izbor = await test_input('Odaberi jednu od ponuđenih opcija: ')
            if izbor == 'a':
                test_print('Odabrao si opciju: ' + izbor)
                test_print('Podnuđene pizze su: ')
                # test_print(popisPizza)
                for i in popisPizza:
                    test_print(i)
            elif izbor == 'b':
                test_print('Odabrao si opciju: ' + izbor + ' \\n')
                test_print('Podnuđene pizze su: ')
                test_print(popisPizza)
                izborPizze = await test_input('Koju pizzu' + imeOsobe + 'želiš naručiti? ')
                if izborPizze == '1':
                    test_print('Tvoj izbor je Margherita')
                    test_print('Tvoj izbor je ' + popisPizza[0])
                elif izborPizze == '2':
                    test_print('Tvoj izbor je Funghi')
                    test_print('Tvoj izbor je ' + popisPizza[1])
                else:
                    test_print('Na žalost taj izbor nemamo u našem menu')
            else:
                test_print(
                    'Došlo je do nesporazuma, nisi odabrao niti jednu ponuđenu opciju.')
                test_print('Molim te odaberi ponovno\\n')
    except KillProgram:
        pass
    except Exception as e:
        raise e
    finally:
        return locals()


class Result:
    def __init__(self, test_pass, test_type, comment=None):
        self.test_pass = test_pass
        self.type = test_type
        self.comment = comment

    def to_dict(self):
        return {"test_pass": self.test_pass, "type": self.type, "comment": self.comment}


async def main():
    try:
        defines = await internal_func_name_user_code()
    except KillProgram:
        defines = {}
        pass
    except Exception as e:
        raise e

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
                       f'found: {len(outputs)}, expected: {len(expected_outputs)}'))
    else:
        results.append(Result(True, 'number_of_prints',
                       'Correct number of prints'))

        for i in range(len(outputs)):
            a = " ".join(map(lambda x: str(x), list(outputs[i])))
            b = expected_outputs[i]

            if b.startswith('/') and b.endswith('/'):
                match = re.match(b[1:-1], a)
                if match is None:
                    results.append(
                        Result(False, 'match', f'index[{i}]: REGEX "{a}" does not match "{b}"'))
                else:
                    results.append(
                        Result(True, 'match', f'index[{i}]: "{a}" is correct'))
            elif a != b:
                results.append(
                    Result(False, 'match', f'index[{i}]: "{a}" does not match "{b}"'))
            else:
                results.append(
                    Result(True, 'match', f'index[{i}]: "{a}" is correct'))

    return json.dumps(list(map(lambda x: x.to_dict(), results)))

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    res = loop.run_until_complete(main())
    print(json.dumps([t for t in json.loads(res)
          if t['test_pass'] == False], indent=4, sort_keys=True))
    loop.close()
