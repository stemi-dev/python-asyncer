import faker from "faker";
import { generateTest } from "../../lib";

import t from "../input.json";

const out = generateTest(t as any, faker);
console.log(out);
