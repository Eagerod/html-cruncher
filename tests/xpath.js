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

module.exports.testIndexingOutOfBounds = function(test) {
    var html = fs.readFileSync("./tests/xpath.html");
    var document = HTMLElement.fromString(html.toString());
    test.deepEqual(document.xpath("/bookstore/book[3]"), []);
    test.done();
};

module.exports.testIndexingPosition = function(test) {
    var html = fs.readFileSync("./tests/xpath.html");
    var document = HTMLElement.fromString(html.toString());
    test.deepEqual(document.xpath("/bookstore/book[position() = 2]"), [document.children[1].children[1]]);
    test.done();
};

module.exports.testIndexingPositionWithSize = function(test) {
    var html = fs.readFileSync("./tests/xpath.html");
    var document = HTMLElement.fromString(html.toString());
    test.deepEqual(document.xpath("/bookstore/book[position() = size()]"), [document.children[1].children[1]]);
    test.deepEqual(document.xpath("/bookstore/book[position() = size() - 1]"), [document.children[1].children[0]]);
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

module.exports.testRecursiveSearchAttributeFilter = function(test) {
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

module.exports.testRecursiveSearchAttributeNode = function(test) {
    var html = fs.readFileSync("./tests/xpath.html");
    var document = HTMLElement.fromString(html.toString());
    var titles = document.getElementsByTagName("title");
    var expected = titles.map(function(title) {
        return title.attributes.lang;
    });
    test.deepEqual(document.xpath("//@lang"), expected);
    test.done();
};

module.exports.testSearchAttributes = function(test) {
    var html = fs.readFileSync("./tests/nav.html");
    var document = HTMLElement.fromString(html.toString());
    var elems = document.getElementsByTagName("a");
    var attribs = [elems[1].attributes.id, elems[2].attributes.id, elems[3].attributes.id];
    test.deepEqual(document.xpath("//div[@class='nav raised']/ul/li/a/@id"), attribs);
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

module.exports.multipleRecursive = function(test) {
    var html = fs.readFileSync("./tests/nav.html");
    var document = HTMLElement.fromString(html.toString());
    var listElements = document.getElementsByTagName("li");
    test.deepEqual(document.xpath("//div//li"), listElements);
    test.done();
};

module.exports.hasDashesInTagName = function(test) {
    var html = fs.readFileSync("./tests/nav.html");
    var document = HTMLElement.fromString(html.toString());
    var listElements = document.getElementsByTagName("custom-footer");
    test.deepEqual(document.xpath("//custom-footer"), listElements);
    test.done();
};

module.exports.hasDashesInAttributeName = function(test) {
    var html = fs.readFileSync("./tests/nav.html");
    var document = HTMLElement.fromString(html.toString());
    var listElements = document.getElementsByClassName("fancy");
    test.deepEqual(document.xpath("//div[@ng-show='something > 1']"), listElements);
    test.done();
};
