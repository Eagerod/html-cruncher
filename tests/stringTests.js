"use strict";

var HTMLElement = require("..")

exports.basic = function(test) {
    test.expect(1)
    var element = HTMLElement.fromString("<h1>text goes here</h1>")
    var expected = "<h1>\n    text goes here\n</h1>"
    test.equals(element.toString(), expected);
    test.done();
}

exports.testSomeStructure = function(test) {
    test.expect(1)
    var element = HTMLElement.fromString("<html><title>Hello World!</title><body>Here's some HTML</body></html>")
    var expected = "<html>\n    <title>\n        Hello World!\n    </title>\n    <body>\n        Here's some HTML\n    </body>\n</html>"
    test.equals(element.toString(), expected);
    test.done();
}
