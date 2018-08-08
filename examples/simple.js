var requireTree = require('..');

requireTree.start();

require('util');
require('console');
require('http');
require('fs');
require('../tests/lib/foo');

requireTree.stop();

var tree = requireTree.getTree();

requireTree.printTree(tree);

console.log(JSON.stringify(tree, null, 2));
