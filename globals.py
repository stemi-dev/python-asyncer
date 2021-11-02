async def custom_input(prompt: str):
    return input(prompt)


async def custom_print(*args, **kwargs):
    print(*args, **kwargs)
