# html-cruncher

html-cruncher is a light-weight, dependency-free package for parsing HTML documents. 
It was born out of the necessity to have an easy interface for finding certain elements
in a page's DOM.

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

