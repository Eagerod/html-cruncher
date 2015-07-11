"use strict";

var fs = require("fs");
var HTMLElement = require("..");

var testJson = require("./tests.json");
var bigTestJson = require("./bigTests.json");

function recurseTestItems(base, name, items, isFile) {
    if ( items instanceof Array ) {
        var input = items[0];
        var expected = items[1];
        if ( isFile ) {
            input = fs.readFileSync(input).toString();
        }
        var element = HTMLElement.fromString(input).children;
        base[name] = function(test) {
            test.expect(1);
            test.deepEqual(expected, element);
            test.done();
        };
    }
    else {
        if ( name ) {
            base = base[name] = {};
        }
        for ( var i in items ) {
            if ( items.hasOwnProperty(i) ) {
                recurseTestItems(base, i, items[i], isFile);
            }
        }
    }
}

recurseTestItems(exports, null, testJson, false);
recurseTestItems(exports, null, bigTestJson, true);

exports.searchTests = require("./searchTests");
