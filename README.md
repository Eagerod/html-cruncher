# html-cruncher

[![Build Status](https://travis-ci.org/Eagerod/html-cruncher.svg?branch=master)](https://travis-ci.org/Eagerod/html-cruncher)

html-cruncher is a light-weight, dependency-free package for parsing HTML documents. 
It was born out of the necessity to have an easy interface for finding certain elements in a page's DOM.

## Usage

Start out by installing html-cruncher using npm:

    npm install html-cruncher

Set up your node project to use the html-cruncher:

```javascript
var request = require("request");
var HTMLElement = require("html-cruncher");

request("http://www.google.com", function(err, response, body) {
	var document = HTMLElement.fromString(body);
})
```

### Features

Once you've gotten a parsed DOM, you can search against it using the same methods
that you'd typically use in browser-side JavaScript. 

- `getElementById`
- `getElementsByClassName`
- `getElementsByTagName`

There's also a small subset of XPath available through the `xpath` method on `HTMLElement`. 
You can select elements in a DOM by providing some simple xpath commands:

- Element selection, direct child and full DOM.
- Predicates
    - Select node at index.
    - Only select text nodes.
    - Attribute equality.

More will be added as needs arise, but for now, this is all that's needed all uses of this package I've been informed of. 
