var assert = require('assert-plus');

function clearRequireCache() {
    Object.keys(require.cache).forEach(function (key) {
        delete require.cache[key];
    });
}

var requireTree = require('..');

requireTree.start();
assert.deepEqual(requireTree.getTree(), {}, 'requireTree empty');

require('util');
require('console');
require('http');
require('fs');
require('./lib/foo');

requireTree.stop();
requireTree.printTree();

clearRequireCache();

requireTree.start();
assert.deepEqual(requireTree.getTree(), {}, 'requireTree empty');

require('util');
require('console');
require('http');
require('fs');
require('./lib/foo');

requireTree.stop();
requireTree.printTree({maxDepth: 1, indent: '\t'});
