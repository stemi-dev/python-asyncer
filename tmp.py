import json
import re

index = -1
inputs = ["Yazmin","a"]
expected_definitions = {"imeOsobe":"Yazmin"}
expected_outputs = ["Bok!","/Yazmin/","/a\\..*/","/b\\..*/","/.*: a/","/.*/","/\\[.*,.*\\]/"]
outputs = []


async def custom_input(prompt: str):
    global index
    index += 1
    return inputs[index]


def custom_print(*args, **kwargs):
    outputs.append(args)

async def internal_func_name_user_code():
    popisPizza = ['1. Margherita(rajčica,sir)','2. Funghi(rajčica,sir,funghi)']
    custom_print('Bok!')
    imeOsobe = await custom_input('Ja sam PizzaBot. Kako se zoveš?' )
    custom_print('Drago mi je ' + imeOsobe + '. Što želiš napraviti dalje:')
    while True:
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
            
    return locals()

class Result:
    def __init__(self, test_pass, test_type, comment=None):
        self.test_pass = test_pass
        self.type = test_type
        self.comment = comment

    def to_dict(self):
        return {"test_pass": self.test_pass, "type": self.type, "comment": self.comment}
  
  
async def main():
    defines = await internal_func_name_user_code()

    results = []
    for key in expected_definitions:
        if key not in defines:
            results.append(Result(False, 'defined', "variable {key} not found"))
        elif defines[key] != expected_definitions[key]:
            comment = f"variable {key} not expected value, found: {defines[key]}, expected: {expected_definitions[key]}"
            results.append(Result(False, 'defined', comment))
        else:
            results.append(Result(True, 'defined', key))

    if len(outputs) != len(expected_outputs):
        results.append(Result(False, 'number_of_prints', f'found: {len(outputs)}, expected: {len(expected_outputs)}'))
    else:
        results.append(Result(True, 'number_of_prints', 'Correct number of prints'))

        for i in range(len(outputs)):
            a = " ".join(map(lambda x: str(x), list(outputs[i])))
            b = expected_outputs[i]

            if b.startswith('/') and b.endswith('/'):
                match = re.match(b[1:-1], a)
                if match is None:
                    results.append(Result(False, 'match', f'index[{i}]: REGEX "{a}" does not match "{b}"'))
                else:
                    results.append(Result(True, 'match', 'index[{i}]: "{a}" is correct'))
            elif a != b:
                results.append(Result(False, 'match', f'index[{i}]: "{a}" does not match "{b}"'))
            else:
                results.append(Result(True, 'match', 'index[{i}]: "{a}" is correct'))

    return json.dumps(list(map(lambda x: x.to_dict(), results)))