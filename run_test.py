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
