/*
 * Calculate a tree object for all require statements with timing statistics
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: August 02, 2018
 * License: MIT
 */

var assert = require('assert-plus');
var Module = require('module');
var util = require('util');

var originalLoad = Module._load;
var tree = {};
var ptrs = [];
var ptr;

function hap(o, p) {
    return ({}).hasOwnProperty.call(o, p);
}

function customLoad() {
    var name = arguments[0];
    var err;

    assert.object(ptr, 'ptr');

    /*
     * It can be the case that a module is required more than once in a file.
     * If this happens, we ignore everything but the first require, since that
     * will be the slowest in the case where it is not already cached.
     */
    if (!hap(ptr, name)) {
        ptr[name] = {
            children: {},
            delta: null
        };
    }
    ptrs.push(ptr);
    ptr = ptr[name].children;

    var started = process.hrtime();
    var o;
    try {
        /*
         * It's possible for the original Module._load to fail here.  In that
         * case, we hold onto to the error and rethrow it after we take care of
         * our own accounting.
         */
        o = originalLoad.apply(Module, arguments);
    } catch (e) {
        err = e;
    }
    var delta = process.hrtime(started);

    ptr = ptrs.pop();
    assert.object(ptr, 'ptr');
    assert.object(ptr[name]);

    /*
     * Only record the delta if we don't already have - see case above where
     * the same file is required more than once.
     */
    if (!ptr[name].delta) {
        ptr[name].delta = delta;
    }

    if (err) {
        throw err;
    }

    return o;
}

module.exports.start = function start() {
    tree = {};
    ptr = tree;
    Module._load = customLoad;
};

module.exports.stop = function stop() {
    Module._load = originalLoad;
};

module.exports.getTree = function getTree() {
    return tree;
}

module.exports.formatTree = function formatTree(opts, t, level) {
    opts = opts || {};
    t = t || tree;
    level = level || 0;

    assert.object(opts, 'opts');
    assert.object(t, 't');
    assert.number(level, 'level');

    var indent = opts.indent === undefined ? '  ' : opts.indent;
    var maxDepth = opts.maxDepth === undefined ? Infinity : opts.maxDepth;

    assert.string(indent, 'indent');
    assert.number(maxDepth, 'maxDepth');

    if (level > maxDepth) {
        return '';
    }

    var output = '';

    Object.keys(t).forEach(function (name) {
        var o = t[name];

        var delta = o.delta;
        var children = o.children;

        var secs = ((delta[0] * 1000) + Math.round(delta[1] / 1e6)) / 1000;
        var time = util.format('%ss', secs.toFixed(3));

        var s = util.format('%s-> %s %s\n',
            new Array(level+1).join(indent),
            name,
            time);

        output += s;

        output += formatTree(opts, children, level + 1);
    });

    return output;
};

module.exports.printTree = function printTree(opts, t) {
    process.stdout.write(module.exports.formatTree(opts, t));
};
