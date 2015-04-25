"use strict";

var HTMLElement = require("../index");

exports.testNestedLikeObjects = function(test)
{
	test.expect(1);
	var testDocument = require("fs").readFileSync("./tests/nav.html").toString();
	var parsed = HTMLElement.fromString(testDocument).children;
	var result = [{
		dataType : HTMLElement.DataTypes.Tag,
		content : "div",
		attributes : { id : "header" },
		children : [{
			dataType : HTMLElement.DataTypes.Tag,
			content : "br",
			attributes : { class : "break" }
		}, {
			dataType : HTMLElement.DataTypes.Tag,
			content : "div",
			attributes : { id : "leftheader" },
			children : [{
				dataType : HTMLElement.DataTypes.Tag,
				content : "a",
				attributes : { href : "/" },
				children : [{
					dataType : HTMLElement.DataTypes.Text,
					content : "Home"
				}]
			}]
		}, {
			dataType : HTMLElement.DataTypes.Tag,
			content : "div",
			attributes : { id : "rightheader" },
			children : [{
				dataType : HTMLElement.DataTypes.Tag,
				content : "div",
				attributes : { class : "nav raised" },
				children : [{
					dataType : HTMLElement.DataTypes.Tag,
					content : "ul",
					children : [{
						dataType : HTMLElement.DataTypes.Tag,
						content : "li",
						attributes : { class : "highlight" },
						children : [{
							dataType : HTMLElement.DataTypes.Tag,
							content : "a",
							attributes : { id : "nav-page1", href : "/page1" },
							children : [{
								dataType : HTMLElement.DataTypes.Text,
								content : "Page 1"
							}]
						}]
					}, {
						dataType : HTMLElement.DataTypes.Tag,
						content : "li",
						children : [{
							dataType : HTMLElement.DataTypes.Tag,
							content : "a",
							attributes : { id : "nav-page2", href : "/page2" },
							children : [{
								dataType : HTMLElement.DataTypes.Text,
								content : "Page 2"
							}]
						}]
					}, {
						dataType : HTMLElement.DataTypes.Tag,
						content : "li",
						children : [{
							dataType : HTMLElement.DataTypes.Tag,
							content : "a",
							attributes : { id : "nav-page3", href : "/page3" },
							children : [{
								dataType : HTMLElement.DataTypes.Text,
								content : "Page 3"
							}]
						}]
					}]
				}]
			}, {
				dataType : HTMLElement.DataTypes.Tag,
				content : "div",
				attributes : { class : "nav fancy" },
				children : [{
					dataType : HTMLElement.DataTypes.Tag,
					content : "ul",
					children : [{
						dataType : HTMLElement.DataTypes.Tag,
						content : "li",
						children : [{
							dataType : HTMLElement.DataTypes.Tag,
							content : "a",
							attributes : { id : "nav-contact", href : "/contact" },
							children : [{
								dataType : HTMLElement.DataTypes.Text,
								content : "Contact us"
							}]
						}]
					}]
				}]
			}]
		}]
	}];
	test.deepEqual(parsed, result);
	test.done();
}