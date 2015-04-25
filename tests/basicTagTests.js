"use strict";

var HTMLElement = require("../index");

exports.testVerySimpleTag = function(test)
{
	test.expect(1);
	var testDocument = "<h1>text goes here</h1>"
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Tag,
		content : "h1",
		children : [{
			dataType : HTMLElement.DataTypes.Text,
			content : "text goes here"
		}]
	}]);
	test.done();
}

exports.testDoubleTag = function(test)
{
	test.expect(1);
	var testDocument = "<br>text<br>"
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Tag,
		content : "br"
	}, {
		dataType : HTMLElement.DataTypes.Text,
		content : "text"
	}, {
		dataType : HTMLElement.DataTypes.Tag,
		content : "br"
	}]);
	test.done();
}

exports.testBasic = function(test) 
{
	test.expect(1);
	var testDocument = "<html><title>Hello World!</title><body>Here's some HTML</body></html>"
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Tag,
		content : "html",
		children : [{
			dataType : HTMLElement.DataTypes.Tag,
			content : "title",
			children : [{
				dataType : HTMLElement.DataTypes.Text,
				content : "Hello World!"
			}]
		}, {
			dataType : HTMLElement.DataTypes.Tag,
			content : "body",
			children : [{
				dataType : HTMLElement.DataTypes.Text,
				content : "Here's some HTML"
			}]
		}]
	}]);
	test.done();
}

exports.testOnlyText = function(test)
{
	test.expect(1);
	var testDocument = "Here's some text.";
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Text,
		content : "Here's some text."
	}]);
	test.done();
}

exports.testImmediateSiblings = function(test)
{
	test.expect(1);
	var testDocument = "Some Text\n<p>\nSome more text";
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Text,
		content : "Some Text"
	}, {
		dataType : HTMLElement.DataTypes.Tag,
		content : "p"
	}, {
		dataType : HTMLElement.DataTypes.Text,
		content : "Some more text"
	}]);
	test.done();
}
