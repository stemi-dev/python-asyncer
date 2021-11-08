const faker = require("faker");
const { generateTest } = require("../../lib");

const out = generateTest(require("../input.json"), faker);
console.log(out);
