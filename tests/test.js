"use strict";

exports.parseTests = {
	tagTests : require("./basicTagTests"),
	attributeTests : require("./attributeTests"),
	specialTypesTests : require("./specialTypeTests"),
	bigTests : require("./bigTests")
}

exports.searchTests = require("./searchTests");

// exports.oneShotTester = function(test)
// {
// 	test.expect(0);
// 	var testDocument = require("fs").readFileSync("/Users/Aleem/Downloads/feb_282014roundsevenallautomakesinhtmldatafor/Ford_Feb.28_2014.html").toString();
// 	var parsed = HTMLElement.fromString(testDocument);
// 	test.done();
// }
