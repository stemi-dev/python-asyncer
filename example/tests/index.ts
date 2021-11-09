import faker from "faker";
import { generateTest } from "../../lib";

import t from "../foo.json";

const out = generateTest(t as any, faker);
console.log(out);
