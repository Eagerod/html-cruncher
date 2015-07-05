"use strict";

exports.parseTests = {
    tagTests : require("./basicTagTests"),
    attributeTests : require("./attributeTests"),
    specialTypesTests : require("./specialTypeTests"),
    bigTests : require("./bigTests")
}

exports.searchTests = require("./searchTests");
