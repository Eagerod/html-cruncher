"use strict";

var HTMLElement = require("../index");

exports.testWithAttributes = function(test)
{
	test.expect(1);
	var testDocument = "<head><script language=\"javascript\">for ( var i = 0; i < 239204; ++i ) { console.log(\"<div>Textibles!</div>\") };</script></head>";
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Tag,
		content : "head",
		children : [{
			dataType : HTMLElement.DataTypes.Tag,
			content : "script",
			attributes : {
				language : "javascript",
			},
			children : [{
				dataType : HTMLElement.DataTypes.Text,
				content : "for ( var i = 0; i < 239204; ++i ) { console.log(\"<div>Textibles!</div>\") };"
			}]
		}]
	}]);
	test.done();
}

exports.testAttributesWithoutQuotes = function(test)
{
	test.expect(1);
	var testDocument = "<font size = 23>some text</font>";
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Tag,
		content : "font",
		attributes : {
			size : "23"
		},
		children : [{
			dataType : HTMLElement.DataTypes.Text,
			content : "some text"
		}]
	}]);
	test.done();
}

exports.testAttributesWithoutValue = function(test)
{
	test.expect(1);
	var testDocument = "<option value='foo' id=\"bar\" selected>";
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Tag,
		content : "option",
		attributes : {
			value : "foo",
			id : "bar",
			selected : null
		}
	}]);
	test.done();
}

exports.testExtraSpacesAllOver = function(test)
{
	test.expect(1);
	var testDocument = "<\n font	\n size='23' \n>  some oddly    spaced text  <\n /	\nfont	 \n>";
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Tag,
		content : "font",
		attributes : {
			size : "23"
		},
		children : [{
			dataType : HTMLElement.DataTypes.Text,
			content : "some oddly    spaced text"
		}]
	}]);
	test.done();
}

exports.testAttributesWithTerminator = function(test) 
{
	test.expect(1);
	var testDocument = "<aTag attribute=\"blah blah blah\" />"
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Tag,
		content : "aTag",
		attributes : {
			attribute : "blah blah blah"
		}
	}]);
	test.done();
}
