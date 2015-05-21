"use strict";

var HTMLElement = require("../index");

exports.testStyle = function(test)
{
	test.expect(1);
	var testDocument = "<style type=\"text/css\">\n body > p\n	{ font-weight: bold; }</style>";
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Tag,
		content : "style",
		attributes : {
			type : "text/css"
		},
		children : [{
			dataType : HTMLElement.DataTypes.Text,
			content : "body > p\n	{ font-weight: bold; }"
		}]
	}]);
	test.done();
}

exports.testCommentInText = function(test) 
{	
	test.expect(1);
	var testDocument = "Here's some stuff <!-- that I totally didn't do --> I did last week";
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Text,
		content : "Here's some stuff"
	}, {
		dataType : HTMLElement.DataTypes.Comment,
		content : "that I totally didn't do"
	}, {
		dataType : HTMLElement.DataTypes.Text,
		content : "I did last week"
	}]);
	test.done();
}

exports.testMultiLineComment = function(test)
{
	test.expect(1);
	var testDocument = "Here's some stuff <!-- that I\ntotally\ndidn't do --> I did last week";
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Text,
		content : "Here's some stuff"
	}, {
		dataType : HTMLElement.DataTypes.Comment,
		content : "that I\ntotally\ndidn't do"
	}, {
		dataType : HTMLElement.DataTypes.Text,
		content : "I did last week"
	}]);
	test.done();
}

exports.testIEComment = function(test)
{
	test.expect(1);
	var testDocument = "Here's some stuff <!--[if IE]> that I totally didn't do <![endif]--> I did last week";
	var parsed = HTMLElement.fromString(testDocument).children;
	test.deepEqual(parsed, [{
		dataType : HTMLElement.DataTypes.Text,
		content : "Here's some stuff"
	}, {
		dataType : HTMLElement.DataTypes.Comment,
		content : "[if IE]> that I totally didn't do <![endif]"
	}, {
		dataType : HTMLElement.DataTypes.Text,
		content : "I did last week"
	}]);
	test.done();
}
