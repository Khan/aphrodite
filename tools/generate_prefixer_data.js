#!/usr/bin/env node
const generateData = require("inline-style-prefixer/generator");
const mkdirp = require("mkdirp");

// We want all of the browser prefixes available, so set the browser version
// to support to 0.
const browserList = {
    chrome: 0,
    android: 0,
    firefox: 0,
    ios_saf: 0,
    safari: 0,
    ie: 0,
    ie_mob: 0,
    edge: 0,
    opera: 0,
    op_mini: 0,
    and_uc: 0,
    and_chr: 0,
};

mkdirp(`${__dirname}/../lib`);
generateData(browserList, {
    staticPath: `${__dirname}/../lib/staticPrefixData.js`,
    compatibility: true,
});
