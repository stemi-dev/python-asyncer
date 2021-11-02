import asyncio
import json
import re


index = -1
# inputs = [1, 2, 20, 'Fran']
# expected_definitions = {"name": "Fran"}
# expected_outputs = [
#     '3',
#     '3',
#     '3',
#     'Your age is: 20',
#     'Hello Fran',
#     '/\\w+ Fran/'
# ]
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
        custom_print(c)
    if 1 == 2:
        for k in range(10):
            custom_print('foo')
    await pero()
    name = await custom_input('name')
    custom_print(f"Hello {name}")
    custom_print(f"Bok {name}")

    return locals()
