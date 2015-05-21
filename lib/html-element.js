/**
	@file HTML element implementation.
*/
"use strict";

/**
	@class HTMLElement
	@classdesc Fairly simple HTML element implementation, that includes
		necessary properties.

	@property dataType {String} The type of item that this instance contains.
	@property content {String} The string contents of the item.
	@property attributes {Object} Arbitrary collection of attributes.
	@property children {HTMLElement[]} Child HTML elements of this one.
*/
function HTMLElement(dataType, content, attributes, children)
{
	if ( dataType ) this.dataType = dataType;
	if ( content ) this.content = content;
	if ( attributes ) this.attributes = attributes;
	if ( children ) this.children = children;
}

/**	
	Represent different types of behaviors that need to be used for the types
	of elements we'll encounter. 

	@property Text - Arbitrary text.
	@property Tag - Any ordinary HTML tag.
	@property Comment - Commented out HTML. Essentially a Text element.
*/
HTMLElement.DataTypes = {
	Text : "text",
	Tag : "tag",
	Comment : "comment"
}

/**
	Regular expressions that are needed throughout.

	@property Text {RegExp} Strip out all text outside of HTML tags.
	@property Tag {RegExp} Extract all contents of a tag, including attributes.
	@property AttributeName {RegExp} Get the name of an attribute.
	@property AttributeValye {RegExp} Get the value of an attribute after
	getting rid of its name.
	@property Comment {RegExp} Strip out the contents of a comment.
*/
HTMLElement.RegExp = {
	Text : /[^\<]*/,
	Tag : /^\<[^\>]*\>/,
	AttributeName : /\s*\w+[^"'\s=]/,
	AttributeValue : /^([^="']+|"[^"]*"|'[^']*')/,
	Comment : /^\<!--(?!--\>)[^]*--\>/
}

/**
	Internal method pretty much only used to make sure that we can have
	an empty element to encompass all top level elements that are parsed
	out.
	@private

	@param buffer {String} Remaining HTML to parse.
	@return The array of elements that were generated.
*/
HTMLElement._fromString = function(buffer)
{
	var elements = [];
	// Determine if this element is going to be a text or tag item.
	while( (buffer = buffer.trim()).length) {
		buffer = this.processBufferIntoElements(buffer, elements);
	}
	return elements;
}

/**
	Method to generate an HTML element.

	@param buffer {String} HTML input to be parsed.
	@return The DOM that was passed in parsed into an object.
*/
HTMLElement.fromString = function(buffer)
{
	var element = new HTMLElement();
	element.children = this._fromString(buffer);
	return element;
}

/**
	Process whatever's left into the array passed in.

	@param buffer {String} Remaining HTML.
	@param elements {HTMLElement[]} Array to be filled with HTMLElements.
	@return The remaining HTML to parse.
*/
HTMLElement.processBufferIntoElements = function(buffer, elements)
{
	if ( buffer.charAt(0) == "<" ) {
		return this.processTagFromBufferIntoElements(buffer, elements);
	}
	else {
		var oneText = buffer.match(HTMLElement.RegExp.Text)[0];
		var element = new HTMLElement(HTMLElement.DataTypes.Text, oneText.trim());
		elements.push(element);
		return buffer.substring(oneText.length);
	}
}

/**
	Process the tag at the beginning of the input string into elements.

	@param buffer {String} Remaining HTML.
	@param elements {HTMLElement[]} Array to be filled with HTMLElements.
	@return The remaining HTML to parse.
*/
HTMLElement.processTagFromBufferIntoElements = function(buffer, elements) 
{
	// First check to see if it's a comment before continuing.
	var comment = buffer.match(HTMLElement.RegExp.Comment);
	if ( comment && comment.length ) {
		var commentText = comment[0];
		var innerComment = commentText.substring(4, commentText.length - 3).trim();
		var element = new HTMLElement(HTMLElement.DataTypes.Comment, innerComment);
		elements.push(element);
		return buffer.substring(commentText.length);
	}

	var oneTag = buffer.match(HTMLElement.RegExp.Tag)[0];
	buffer = buffer.substring(oneTag.length);
	var tagText = oneTag.substring(1, oneTag.length - 1).trim();

	var element = new HTMLElement(HTMLElement.DataTypes.Tag);

	// Does the element have attributes?
	var tagSplit = tagText.split(" ");
	tagText = tagSplit[0].trim();
	var possibleAttributeText = tagSplit.slice(1).join(" ").trim();
	if ( possibleAttributeText.length ) {
		element.attributes = {};
		HTMLElement.processAttributesFromString(possibleAttributeText, element.attributes);
	}
	
	element.content = tagText;
	elements.push(element);
	// Seek an end tag. If there is one, everything inside is a child, as long as
	// other like tags don't start inside. Had to add in an optional backslash,
	// since it's possible for tags to appear in quotes, where the slashes can be 
	// escaped.
	var endTagRegExp = new RegExp("\\<(?:\\s)*(?:\\\\)?/(?:\\s)*" + tagText + "(?:\\s)*\\>", "mgi");
	var bufferSearch = new RegExp(endTagRegExp);
	var startTagRegExp = new RegExp("\\<(\\s)*" + tagText + "([^\\>])*\\>", "igm");

	var one;
	while ( one = bufferSearch.exec(buffer) ) {
		var matchText = buffer.substring(0, one.index);

		var openMatches = 0;
		var closeMatches = 0;

		var test;
		while (test = startTagRegExp.exec(matchText) ) {
			++openMatches;
		}
		while (test = endTagRegExp.exec(matchText) ) {
			++closeMatches;
		}

		if ( openMatches == closeMatches ) {
			if ( element.content == "script" || element.content == "style" ) {
				element.children = [{
					dataType : HTMLElement.DataTypes.Text,
					content : matchText.trim()
				}];
			} 
			else {
				element.children = HTMLElement._fromString(matchText);
			}
			return buffer.substring(matchText.length + one[0].length);
		}
	}
	return buffer;
}

/**
	Parse out elements from a list of attributes.

	@param attributeString {String} The string that contains all of the attributes.
	@param elementAttributes {Object} The object to put all attributes into. 
*/
HTMLElement.processAttributesFromString = function(attributeString, elementAttributes)
{
	while ( attributeString.length ) {
		var attributeName = HTMLElement.RegExp.AttributeName.exec(attributeString);
		if ( attributeName ) {
			attributeString = attributeString.substring(attributeName[0].length).trim();
			if ( attributeString.charAt(0) == "=" ) {
				attributeString = attributeString.substring(1).trim();
				var attributeValue = HTMLElement.RegExp.AttributeValue.exec(attributeString);
				elementAttributes[attributeName[0]] = attributeValue[0].replace(/("|')/g, "");
				attributeString = attributeString.substring(attributeValue[0].length).trim();
			}
			else {
				elementAttributes[attributeName] = null;
			}
		}
		else {
			return;
		}
	}
}

/**
	Get the first element found within this one that has the provided id in its
	attributes object.

	@param id {String} The id to search for.
	@return An HTML element with the provided id.
	@return null if no element is found.
*/
HTMLElement.prototype.getElementById = function(id) {
	if ( this.attributes && this.attributes.id == id ) {
		return this;
	}
	for ( var i in this.children ) {
		var elem = this.children[i].getElementById(id);
		if ( elem ) {
			return elem;
		}
	}
	return null;
}

/**
	Get all elements within this one that have the provided class.

	@param className {String} The class that we're searching for.
	@return An array of elements that have the provided class.
*/
HTMLElement.prototype.getElementsByClassName = function(className) {
	var elements = [];
	var elementQueue = [this];
	while ( elementQueue.length ) {
		var element = elementQueue.shift();
		if ( element.attributes && element.attributes.class ) {
			var classes = element.attributes.class.split(" ");
			if ( classes.indexOf(className) != -1 ) {
				elements.push(element);
			}
		}
		if ( element.children ) {
			elementQueue = elementQueue.concat(element.children);
		}
	}
	return elements;
}

/**
	Get all elements that are tag types that have the provided tag name.

	@param tagName {String} The tag to search for.
	@return an array of elements with the provided tag type.
*/
HTMLElement.prototype.getElementsByTagName = function(tagName) {
	var elements = [];
	var elementQueue = [this];
	while ( elementQueue.length ) {
		var element = elementQueue.shift();
		if ( element.dataType == HTMLElement.DataTypes.Tag && element.content == tagName ) {
			elements.push(element);
		}
		if ( element.children ) {
			elementQueue = elementQueue.concat(element.children);
		}
	}
	return elements;
}

/**
	Get a pretty printed string format of the DOM this object contains.

	@return A 4-space tabbed HTML string.
*/
HTMLElement.prototype.toString = function() {
	return this._toString("", 0);
}

/**
	Recursive method for generating a nice formatted HTML string.

	@return The generated HTML string.
*/
HTMLElement.prototype._toString = function(indent) {
	var toString = indent;
	if ( this.dataType == HTMLElement.DataTypes.Text ) {
		toString += this.content + "\n";
	}
	else if ( this.dataType == HTMLElement.DataTypes.Comment ) {
		toString += "<!--" + this.children[0].content + "-->\n";
	}
	else if ( this.dataType == HTMLElement.DataTypes.Tag ) {
		toString += "<" + this.content;	
		if ( this.attributes ) {
			for ( var i in this.attributes ) {
				toString += " " + i;
				if ( this.attributes[i] != null ) {
					toString += "=\"" + this.attributes[i] + "\"";
				}
			}
		}
		toString += ">\n";
		if ( this.children ) {
			for ( var i = 0; i < this.children.length; ++i ) {
				toString += this.children[i]._toString(indent + "    ");
			}
		}
		toString += indent + "</" + this.content + ">\n";
	}
	return toString;
}

module.exports = HTMLElement;
