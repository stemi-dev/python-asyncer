import asyncio
import json
import re

index = -1
inputs = []
expected_definitions = {}
expected_outputs = []

with open('./output.json', 'r') as f:
    tmp = json.load(f)
    inputs = tmp['input']
    expected_outputs = tmp['output']
    expected_definitions = tmp['defined']

outputs = []


async def custom_input(prompt: str):
    global index
    index += 1
    return inputs[index]


def custom_print(*args, **kwargs):
    outputs.append(args)

async def func():
    async def pero():
        age = int(await custom_input("Enter your age: "))
        custom_print("Your age is:", age)
    a = int(await custom_input('a'))
    b = int(await custom_input('b'))
    c = a + b
    c2 = a * b
    for i in range(3):
        custom_print(a + b)
    if 1 == 2:
        for k in range(10):
            custom_print('foo')
    await pero()
    name = await custom_input('name')
    custom_print(f"Hello {name}")
    custom_print(f"Bok {name}")
    return locals()


loop = asyncio.get_event_loop()
defines = loop.run_until_complete(func())
loop.close()

for key in expected_definitions:
    assert defines[key] == expected_definitions[key]

if len(outputs) != len(expected_outputs):
    print('Wrong number of stuff')
    exit(1)

for i in range(len(outputs)):
    a = " ".join(map(lambda x: str(x), list(outputs[i])))
    b = expected_outputs[i]

    if b.startswith('/') and b.endswith('/'):
        match = re.match(b[1:-1], a)
        if match is None:
            print(f'{a} does not match {b}')
            exit(1)
    elif a != b:
        print(f'Wrong output {i}')
        exit(1)
    else:
        print(f'{i}: {a}')

print('All good')
