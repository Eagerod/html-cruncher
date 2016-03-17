"use strict";

var fs = require("fs");

var HTMLElement = require("..");

module.exports.testBasic = function(test) {
    var html = fs.readFileSync("./tests/xpath.html");
    var document = HTMLElement.fromString(html.toString());
    test.deepEqual(document.xpath("/bookstore"), [document.children[1]]);
    test.done();
};

module.exports.testIndexing = function(test) {
    var html = fs.readFileSync("./tests/xpath.html");
    var document = HTMLElement.fromString(html.toString());
    test.deepEqual(document.xpath("/bookstore/book[1]"), [document.children[1].children[0]]);
    test.done();
};

module.exports.testRecursiveSearch = function(test) {
    var html = fs.readFileSync("./tests/xpath.html");
    var document = HTMLElement.fromString(html.toString());
    test.deepEqual(document.xpath("//book"), document.getElementsByTagName("book"));
    test.done();
};

module.exports.testRecursiveSearchText = function(test) {
    var html = fs.readFileSync("./tests/xpath.html");
    var document = HTMLElement.fromString(html.toString());
    var expected = document.getElementsByTagName("title").map(function(elem) {
        return elem.children[0];
    });
    test.deepEqual(document.xpath("//book/title[text()]"), expected);
    test.done();
};

module.exports.testRecursiveSearchAttribute = function(test) {
    var html = fs.readFileSync("./tests/xpath.html");
    var document = HTMLElement.fromString(html.toString());
    test.deepEqual(document.xpath("//title[@lang]"), document.getElementsByTagName("title"));
    test.done();
};

module.exports.testRecursiveSearchAttributeValue = function(test) {
    var html = fs.readFileSync("./tests/xpath.html");
    var document = HTMLElement.fromString(html.toString());
    test.deepEqual(document.xpath("//title[@lang='en']"), document.getElementsByTagName("title"));
    test.done();
};

module.exports.testSearchSelectAll = function(test) {
    var html = fs.readFileSync("./tests/xpath.html");
    var document = HTMLElement.fromString(html.toString());
    var titles = document.getElementsByTagName("title");
    var prices = document.getElementsByTagName("price");
    var expected = [
        titles[0],
        titles[0].children[0],
        prices[0],
        prices[0].children[0],
        titles[1],
        titles[1].children[0],
        prices[1],
        prices[1].children[0]
    ];
    test.deepEqual(document.xpath("//book//*"), expected);
    test.done();
};

module.exports.testSearchSelectAll = function(test) {
    var html = fs.readFileSync("./tests/xpath.html");
    var document = HTMLElement.fromString(html.toString());
    var titles = document.getElementsByTagName("title");
    var prices = document.getElementsByTagName("price");
    var expected = [
        titles[0],
        prices[0],
        titles[1],
        prices[1]
    ];
    test.deepEqual(document.xpath("//book/*"), expected);
    test.done();
};

module.exports.testSelectAllWithAttributes = function(test) {
    var html = fs.readFileSync("./tests/xpath.html");
    var document = HTMLElement.fromString(html.toString());
    var titles = document.getElementsByTagName("title");
    var elements = [];
    elements.push(document.children[0]);
    elements = elements.concat(titles);
    test.deepEqual(document.xpath("//*[@*]"), elements);
    test.done();
};

module.exports.testHtmlDocument = function(test) {
    var html = fs.readFileSync("./tests/nav.html");
    var document = HTMLElement.fromString(html.toString());
    test.deepEqual(document.xpath("//li[@class='highlight']"), document.getElementsByClassName("highlight"));
    test.deepEqual(document.xpath("/div/div//br"), []);
    test.deepEqual(document.xpath("/div/div/div"), document.getElementsByClassName("nav"));

    var textNodes = document.xpath("//li/a[text()]");
    var text = textNodes.map(function(elem) {
        return elem.content;
    });
    test.deepEqual(text, ["Page 1", "Page 2", "Page 3", "Contact us"]);
    test.done();
};
