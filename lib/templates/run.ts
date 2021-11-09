import { AsyncifyENV } from "../asyncify";
import { MAIN_FUNTION } from "../const";

export const run: Record<AsyncifyENV, string> = {
  native: `def ${MAIN_FUNTION}():
  loop = asyncio.get_event_loop()
  defines = loop.run_until_complete(func())
  loop.close()`,
  browser: `async def ${MAIN_FUNTION}():
  await func()`,
  tests: `class Result:
    def __init__(self, test_pass, test_type, comment=None):
        self.test_pass = test_pass
        self.type = test_type
        self.comment = comment

    def to_dict(self):
        return {"test_pass": self.test_pass, "type": self.type, "comment": self.comment}
  
  
async def ${MAIN_FUNTION}():
    defines = await func()

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

    return json.dumps(list(map(lambda x: x.to_dict(), results)))`,
};
