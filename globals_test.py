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
