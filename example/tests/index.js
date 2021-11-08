const faker = require('faker');
const formatInput = require('../../lib/testGenerator');

const t = require('../input.json');

const out = formatInput(t, faker);
console.log(out)