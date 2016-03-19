"use strict";

var HTMLElement = require("../index");

exports.searchForId = function(test) {
    test.expect(2);
    var testDocument = require("fs").readFileSync("./tests/nav.html").toString();
    var document = HTMLElement.fromString(testDocument);
    var element = document.getElementById("header");
    test.equal(element.attributes.id.content, "header");
    element = document.getElementById("notheader");
    test.equal(element, null);
    test.done();
};

exports.searchForClass = function(test) {
    test.expect(3);
    var testDocument = require("fs").readFileSync("./tests/nav.html").toString();
    var document = HTMLElement.fromString(testDocument);
    test.equal(document.getElementsByClassName("nav").length, 2);
    test.equal(document.getElementsByClassName("break").length, 1);
    test.equal(document.getElementsByClassName("header").length, 0);
    test.done();
};

exports.searchForTags = function(test) {
    test.expect(3);
    var testDocument = require("fs").readFileSync("./tests/nav.html").toString();
    var document = HTMLElement.fromString(testDocument);
    test.equal(document.getElementsByTagName("li").length, 4);
    test.equal(document.getElementsByTagName("br").length, 1);
    test.equal(document.getElementsByTagName("script").length, 0);
    test.done();
};
