"use strict";

var fs = require("fs");
var HTMLElement = require("..");

var testJson = require("./tests.json");
var bigTestJson = require("./bigTests.json");

function assertAllElementsAreHTMLElement(test, element) {
    if ( !(element instanceof HTMLElement) ) {
        return test.fail("All elements and children not HTMLElement");
    }
    for ( var i in element.children ) {
        var e = element.children[i];
        assertAllElementsAreHTMLElement(test, e);
    }
}

function recurseTestItems(base, name, items, isFile) {
    if ( items instanceof Array ) {
        var input = items[0];
        var expected = items[1];
        if ( isFile ) {
            input = fs.readFileSync(input).toString();
        }
        var element = HTMLElement.fromString(input);
        base[name] = function(test) {
            test.expect(1);
            assertAllElementsAreHTMLElement(test, element);
            test.deepEqual(expected, element.children);
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
exports.stringTests = require("./stringTests");
