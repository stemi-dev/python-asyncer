import json
import re


async def internal_func_name_user_code():
    async def pero():
        age = int(await custom_input("Enter your age: "))
        custom_print("Your age is:", age)  # + 1)
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
    name = await custom_input('name')  # + '1'
    custom_print(f"Hello {name}")
    custom_print(f"Bok {name}")
    return locals()

async def main():
  await func()