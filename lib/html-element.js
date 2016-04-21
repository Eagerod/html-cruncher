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
*/
function HTMLElement(dataType, content) {
    this.dataType = dataType;
    if (content) {
        this.content = content;
    }
}

/**
    Represent different types of behaviors that need to be used for the types
    of elements we'll encounter.

    @property Text - Arbitrary text.
    @property Tag - Any ordinary HTML tag.
    @property Comment - Commented out HTML. Essentially a Text element.
*/
HTMLElement.DataTypes = {
    Text: "text",
    Tag: "tag",
    Comment: "comment",
    Attribute: "attribute"
};

/**
    Regular expressions that are needed throughout.

    @property Text {RegExp} Strip out all text outside of HTML tags.
    @property Tag {RegExp} Extract all contents of a tag, including attributes.
    @property AttributeName {RegExp} Get the name of an attribute.
    @property AttributeValye {RegExp} Get the value of an attribute after
    getting rid of its name.
    @property Comment {RegExp} Strip out the contents of a comment.
    @property XPath {Object} A few XPath related RegExps.
    @property FullTag {RegExp} A really long regular expression that extracts
    the first complete tag and attributes from the input.
*/
HTMLElement.RegExp = {
    Text: /[^]+?((?=\<([a-zA-Z_]|\!--))|$)/,
    AttributeName: /[^\s\=\>]+/,
    AttributeValue: /^([^\"\'\>\s]+|\"[^\"]*\"|\'[^\']*\')/,
    Comment: /^\<!--[^]+?(?=--\>)--\>/,
    XPath: {
        ChildNodeSearch: /^\/(@?\w+|\*)/,
        AnyNodeSearch: /^\/\/(@?\w+|\*)/,
        Predicate: /^\[([^\]]+)\]/
    }
};

HTMLElement.RegExp.FullTag = new RegExp(
    "^\\<\\s*" + // Tag open
    HTMLElement.RegExp.AttributeName.source + // Tag Name
    "(" + // Optional Attribute list.
        "(\\s*" +
            HTMLElement.RegExp.AttributeName.source + // Attribute Name.
        "\\s*)" +
        "(\\s*\\=\\s*" + // If there's a "value" there's an =.
            "(" +
                HTMLElement.RegExp.AttributeValue.source.substring(1) +
            ")?" + // Optional string value within the whole value.
        "\\s*)?" + // Or one with a value.
    ")*" +
    "\\s*\\>" // Tag close.
);

/**
    Internal method pretty much only used to make sure that we can have
    an empty element to encompass all top level elements that are parsed
    out.
    @private

    @param buffer {String} Remaining HTML to parse.
    @return The array of elements that were generated.
*/
HTMLElement._fromString = function(buffer) {
    var elements = [];
    // Determine if this element is going to be a text or tag item.
    while( (buffer = buffer.trim()).length) {
        buffer = this.processBufferIntoElements(buffer, elements);
    }
    return elements;
};

/**
    Method to generate an HTML element.

    @param buffer {String} HTML input to be parsed.
    @return The DOM that was passed in parsed into an object.
*/
HTMLElement.fromString = function(buffer) {
    var element = new HTMLElement();
    element.children = this._fromString(buffer);
    return element;
};

/**
    Process whatever's left into the array passed in.

    @param buffer {String} Remaining HTML.
    @param elements {HTMLElement[]} Array to be filled with HTMLElements.
    @return The remaining HTML to parse.
*/
HTMLElement.processBufferIntoElements = function(buffer, elements) {
    if ( buffer.charAt(0) === "<" ) {
        return this.processTagFromBufferIntoElements(buffer, elements);
    }

    var oneText = buffer.match(HTMLElement.RegExp.Text)[0];
    var element = new HTMLElement(HTMLElement.DataTypes.Text, oneText.trim());
    elements.push(element);
    return buffer.substring(oneText.length);
};

/**
    Find a complete tag inside a given string. Uses a big regex to find all bits
    of the element name, as well as attributes.

    @param buffer {String} The string to search in for a tag element.
*/
HTMLElement.findTagInString = function(buffer) {
    var match = buffer.match(HTMLElement.RegExp.FullTag);
    return match[0];
};

/**
    Process the tag at the beginning of the input string into elements.

    @param buffer {String} Remaining HTML.
    @param elements {HTMLElement[]} Array to be filled with HTMLElements.
    @return The remaining HTML to parse.
*/
HTMLElement.processTagFromBufferIntoElements = function(buffer, elements) {
    // First check to see if it's a comment before continuing.
    var comment = buffer.match(HTMLElement.RegExp.Comment);
    if ( comment && comment.length ) {
        var commentText = comment[0];
        var innerComment = commentText.substring(4, commentText.length - 3).trim();
        elements.push(new HTMLElement(HTMLElement.DataTypes.Comment, innerComment));
        return buffer.substring(commentText.length);
    }

    var oneTag = HTMLElement.findTagInString(buffer);
    buffer = buffer.substring(oneTag.length);
    var tagText = oneTag.substring(1, oneTag.length - 1).trim();

    var element = new HTMLElement(HTMLElement.DataTypes.Tag);

    // Does the element have attributes?
    var tagSplit = tagText.split(/\s/);
    var tagName = tagSplit[0].trim();
    var possibleAttributeText = tagText.substring(tagName.length).trim();
    if ( possibleAttributeText.length ) {
        element.attributes = {};
        HTMLElement.processAttributesFromString(possibleAttributeText, element.attributes);
    }

    element.content = tagName;
    elements.push(element);
    // Seek an end tag. If there is one, everything inside is a child, as long as
    // other like tags don't start inside. Had to add in an optional backslash,
    // since it's possible for tags to appear in quotes, where the slashes can be
    // escaped.
    var endTagRegExp = new RegExp("\\<(?:\\s)*(?:\\\\)?/(?:\\s)*" + tagName + "(?:\\s)*\\>", "mgi");
    var bufferSearch = new RegExp(endTagRegExp);
    var startTagRegExp = new RegExp("\\<(\\s)*" + tagName + "([^\\>])*\\>", "igm");

    var one;
    while ( (one = bufferSearch.exec(buffer)) ) {
        var matchText = buffer.substring(0, one.index);

        var openMatches = 0;
        var closeMatches = 0;

        while (startTagRegExp.exec(matchText)) {
            ++openMatches;
        }
        while (endTagRegExp.exec(matchText)) {
            ++closeMatches;
        }

        if ( openMatches === closeMatches ) {
            if ( element.content === "script" || element.content === "style" ) {
                var childElement = new HTMLElement(HTMLElement.DataTypes.Text, matchText.trim());
                element.children = [childElement];
            }
            else {
                element.children = HTMLElement._fromString(matchText);
            }
            return buffer.substring(matchText.length + one[0].length);
        }
    }
    return buffer;
};

/**
    Parse out elements from a list of attributes.

    @param attributeString {String} The string that contains all of the attributes.
    @param elementAttributes {Object} The object to put all attributes into.
*/
HTMLElement.processAttributesFromString = function(attributeString, elementAttributes) {
    while ( attributeString.length ) {
        var attributeName = HTMLElement.RegExp.AttributeName.exec(attributeString);

        if (!attributeName || attributeName[0] === "/") {
            return;
        }

        var attribute = new HTMLElement(HTMLElement.DataTypes.Attribute);

        attributeString = attributeString.substring(attributeName[0].length).trim();
        if (attributeString.charAt(0) === "=") {
            attributeString = attributeString.substring(1).trim();
            var attributeValue = HTMLElement.RegExp.AttributeValue.exec(attributeString);

            if (attributeValue) {
                attribute.content = attributeValue[0].replace(/("|')/g, "");
                attributeString = attributeString.substring(attributeValue[0].length).trim();
            }
        }
        elementAttributes[attributeName[0]] = attribute;
    }
};

/**
    Get the first element found within this one that has the provided id in its
    attributes object.

    @param id {String} The id to search for.
    @return An HTML element with the provided id.
    @return null if no element is found.
*/
HTMLElement.prototype.getElementById = function(id) {
    if ( this.attributes && this.attributes.id && this.attributes.id.content === id ) {
        return this;
    }
    for ( var i in this.children ) {
        var elem = this.children[i].getElementById(id);
        if ( elem ) {
            return elem;
        }
    }
    return null;
};

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
            var classes = element.attributes.class.content.split(" ");
            if ( classes.indexOf(className) !== -1 ) {
                elements.push(element);
            }
        }
        if ( element.children ) {
            elementQueue = elementQueue.concat(element.children);
        }
    }
    return elements;
};

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
        if ( element.dataType === HTMLElement.DataTypes.Tag && element.content === tagName ) {
            elements.push(element);
        }
        if ( element.children ) {
            elementQueue = elementQueue.concat(element.children);
        }
    }
    return elements;
};

/**
    Get a pretty printed string format of the DOM this object contains.

    @return A 4-space tabbed HTML string.
*/
HTMLElement.prototype.toString = function() {
    return this._toString("", 0);
};

/**
    Recursive method for generating a nice formatted HTML string.

    @return The generated HTML string.
*/
HTMLElement.prototype._toString = function(indent) {
    var toString = indent;
    if ( this.dataType === HTMLElement.DataTypes.Text ) {
        toString += this.content + "\n";
    }
    else if ( this.dataType === HTMLElement.DataTypes.Comment ) {
        toString += "<!--" + this.content + "-->\n";
    }
    else if ( this.dataType === HTMLElement.DataTypes.Tag ) {
        toString += "<" + this.content;
        if ( this.attributes ) {
            for ( var i in this.attributes ) {
                toString += " " + i;
                if ( this.attributes[i].content != null ) {
                    toString += "=\"" + this.attributes[i].content + "\"";
                }
            }
        }
        toString += ">\n";
        for ( var j in this.children ) {
            toString += this.children[j]._toString(indent + "    ");
        }
        toString += indent + "</" + this.content + ">\n";
    }
    else { // Root element
        for ( var k in this.children ) {
            toString += this.children[k].toString();
        }
        while ( toString[toString.length - 1] === "\n" ) {
            toString = toString.substring(0, toString.length - 1);
        }
    }
    return toString;
};

/**
    Perform an XPath query on this document.

    Currently limited by a pretty limited subset of the whole XPath spec.

    @param query {String} An XPath query string.
    @return {HTMLElement[]} The nodes that matches the query.
*/
HTMLElement.prototype.xpath = function(query) {
    return HTMLElement._xpath([this], query);
};

/**
    Internal method for recursively filtering elements by consuming portions of the XPath query.

    @param filteredElements {HTMLElement[]} The array of elements from the previous step of querying/filtering.
    @param remainingQuery {String} The portion of the query that still needs to be evaluated with the remaining
        elements.
    @return {HTMLElement[]} The nodes that match the query.
*/
HTMLElement._xpath = function (filteredElements, remainingQuery) {
    if (remainingQuery === "") {
        return filteredElements;
    }

    // Possible predicate filter
    if (remainingQuery.indexOf("[") === 0) {
        // This is performing a filter, rather than a search.
        var filterConstraint = remainingQuery.match(HTMLElement.RegExp.XPath.Predicate);
        remainingQuery = remainingQuery.replace(HTMLElement.RegExp.XPath.Predicate, "");

        var predicateElements = HTMLElement._xpathPredicate(filteredElements, filterConstraint[1]);
        return HTMLElement._xpath(predicateElements, remainingQuery);
    }

    // Recursive search
    if ( remainingQuery.indexOf("//") === 0 ) {
        var recursiveMatches = remainingQuery.match(HTMLElement.RegExp.XPath.AnyNodeSearch);
        remainingQuery = remainingQuery.replace(HTMLElement.RegExp.XPath.AnyNodeSearch, "");

        if (recursiveMatches[1].charAt(0) === "@") {
            var recursiveAttribName = recursiveMatches[1].substring(1);
            var recursiveAttribs = filteredElements.reduce(function findAttributes(arr, elem) {
                for (var i in elem.attributes) {
                    if (i === recursiveAttribName) {
                        arr.push(elem.attributes[i]);
                    }
                }
                for (var j in elem.children) {
                    findAttributes(arr, elem.children[j]);
                }
                return arr;
            }, []);
            return HTMLElement._xpath(recursiveAttribs, remainingQuery);
        }

        if (recursiveMatches[1] === "*") {
            var matchesAllElements = filteredElements.reduce(function flattenAllNodes(arr, elem) {
                for (var i in elem.children) {
                    arr.push(elem.children[i]);
                    flattenAllNodes(arr, elem.children[i]);
                }
                return arr;
            }, []);
            return HTMLElement._xpath(matchesAllElements, remainingQuery);
        }

        var matchesTheseElements = filteredElements.reduce(function(arr, elem) {
            return arr.concat(elem.getElementsByTagName(recursiveMatches[1]));
        }, []);
        return HTMLElement._xpath(matchesTheseElements, remainingQuery);
    }

    // Absolute search.
    if ( remainingQuery.indexOf("/") === 0 ) {
        var matches = remainingQuery.match(HTMLElement.RegExp.XPath.ChildNodeSearch);
        remainingQuery = remainingQuery.replace(HTMLElement.RegExp.XPath.ChildNodeSearch, "");

        if (matches[1].charAt(0) === "@") {
            var attribName = matches[1].substring(1);
            var attribs = filteredElements.reduce(function(arr, elem) {
                for (var i in elem.attributes) {
                    if (i === attribName) {
                        arr.push(elem.attributes[i]);
                    }
                }
                return arr;
            }, []);
            return HTMLElement._xpath(attribs, remainingQuery);
        }

        if (matches[1] === "*") {
            var matchesHereElements = filteredElements.reduce(function(arr, elem) {
                return arr.concat(elem.children);
            }, []);
            return HTMLElement._xpath(matchesHereElements, remainingQuery);
        }

        var matchesTheseHereElements = filteredElements.reduce(function(arr, elem) {
            return arr.concat(elem.children.filter(function(child) {
                return matches[1] === child.content && child.dataType === HTMLElement.DataTypes.Tag;
            }));
        }, []);
        return HTMLElement._xpath(matchesTheseHereElements, remainingQuery);
    }

    // I don't really know what else there could be, so just return what we've got.
    return filteredElements;
};

/**
    Filter out the provided elements according to the provided predicate.

    @param filteredElements {HTMLElement[]} The list of nodes to filter.
    @param predicate {String} The predicate to apply to the list of nodes.
    @return {HTMLElement[]} The subset of nodes that matched the predicate.
*/
HTMLElement._xpathPredicate = function(filteredElements, predicate) {
    if (predicate.match(/^\d+$/)) {
        var index = parseInt(predicate) - 1;
        if (index >= filteredElements.length) {
            return [];
        }

        return [filteredElements[index]];
    }

    if (predicate.match(/^text\(\)$/)) {
        var textElements = filteredElements.reduce(function(arr, element) {
            return arr.concat(element.children.filter(function(child) {
                return child.dataType === HTMLElement.DataTypes.Text;
            }));
        }, []);
        return textElements;
    }

    var attributeMatches = predicate.match(/^@(\w+|\*)(?:\=(.*))?$/);
    var attributeName = attributeMatches[1];
    if (attributeMatches[2]) {
        // Has a match for filtering by attribute value.
        var attributeValue = attributeMatches[2];
        if (attributeValue[0] === "'" && attributeValue[attributeValue.length - 1] === "'") {
            attributeValue = attributeValue.substring(1, attributeValue.length - 1);
        }
        else if (attributeValue[0] === "\"" && attributeValue[attributeValue.length - 1] === "\"") {
            attributeValue = attributeValue.substring(1, attributeValue.length - 1);
        }

        var matchingElements = filteredElements.filter(function(elem) {
            return elem.attributes && elem.attributes[attributeName] && elem.attributes[attributeName].content == attributeValue; // eslint-disable-line eqeqeq
        });
        return matchingElements;
    }
    else {
        // Just ones with the attribute present.
        var attributeElements = null;
        if (attributeName === "*") {
            attributeElements = filteredElements.filter(function(elem) {
                return elem.attributes !== undefined;
            });
        }
        else {
            attributeElements = filteredElements.filter(function(elem) {
                return elem.attributes && elem.attributes[attributeName] && elem.attributes[attributeName].content !== undefined;
            });
        }
        return attributeElements;
    }
};

module.exports = HTMLElement;
