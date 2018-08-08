require-time-tree
=================

Calculate a tree object for all require statements with timing

Usage
-----

    npm install require-time-tree

``` js
var requireTree = require('..');

// This clears any previous tree and "starts fresh".  This overrides the
// underlying Module._load function to keep this accounting.
requireTree.start();

require('util');
require('console');
require('http');
require('fs');
require('../tests/lib/foo');

// Restore the original Module._load function
requireTree.stop();

// Get the current tree
var tree = requireTree.getTree();

// Pretty-print the tree formatted nicely
requireTree.printTree(tree);

// Print the raw tree
console.log(JSON.stringify(tree, null, 2));
```

Pretty formatted output

```
-> util 0.000s
-> console 0.000s
-> http 0.009s
-> fs 0.000s
-> ../tests/lib/foo 0.001s
  -> ./bar 0.000s
    -> ./baz 0.000s
```

JSON formatted tree

``` json
{
  "util": {
    "children": {},
    "delta": [
      0,
      28402
    ]
  },
  "console": {
    "children": {},
    "delta": [
      0,
      5772
    ]
  },
  "http": {
    "children": {},
    "delta": [
      0,
      9096897
    ]
  },
  "fs": {
    "children": {},
    "delta": [
      0,
      5083
    ]
  },
  "../tests/lib/foo": {
    "children": {
      "./bar": {
        "children": {
          "./baz": {
            "children": {},
            "delta": [
              0,
              180014
            ]
          }
        },
        "delta": [
          0,
          381260
        ]
      }
    },
    "delta": [
      0,
      657039
    ]
  }
}
```

License
-------

MIT License
