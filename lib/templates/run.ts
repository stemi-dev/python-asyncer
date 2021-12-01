import { AsyncifyENV } from "../asyncify";
import { MAIN_FUNCTION, INTERNAL_FUNC_NAME_USER_CODE } from "../const";

export const run: Record<AsyncifyENV, string> = {
  native: `def ${MAIN_FUNCTION}():
  loop = asyncio.get_event_loop()
  defines = loop.run_until_complete(${INTERNAL_FUNC_NAME_USER_CODE}())
  loop.close()`,
  browser: `async def ${MAIN_FUNCTION}():
  await ${INTERNAL_FUNC_NAME_USER_CODE}()`,
  tests: `class Result:
    def __init__(self, test_pass, test_type, comment=None, verbose=None, index=None):
        self.test_pass = test_pass
        self.type = test_type
        self.comment = comment
        self.verbose = verbose
        self.index = index

    def to_dict(self):
        return {"test_pass": self.test_pass, "type": self.type, "comment": self.comment, "verbose": self.verbose, "index": self.index}
  
  
async def ${MAIN_FUNCTION}():
    try:
        defines = await ${INTERNAL_FUNC_NAME_USER_CODE}()
    except Exception as e:
        return {"error": str(e)}

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
        results.append(Result(False, 'number_of_prints', f'found: {len(outputs)}, expected: {len(expected_outputs)}', verbose=[outputs, expected_outputs]))
    else:
        results.append(Result(True, 'number_of_prints', 'Correct number of prints'))

        for i in range(len(outputs)):
            a = " ".join(map(lambda x: str(x), list(outputs[i])))
            b = expected_outputs[i]

            if b.startswith('/') and b.endswith('/'):
                match = re.match(b[1:-1], a)
                if match is None:
                    results.append(Result(False, 'match', f'index[{i}]: REGEX "{a}" does not match "{b}"', index=i))
                else:
                    results.append(Result(True, 'match', f'index[{i}]: "{a}" is correct', index=i))
            elif a != b:
                results.append(Result(False, 'match', f'index[{i}]: "{a}" does not match "{b}"', index=i))
            else:
                results.append(Result(True, 'match', f'index[{i}]: "{a}" is correct', index=i))

    return json.dumps(list(map(lambda x: x.to_dict(), results)))`,
};
