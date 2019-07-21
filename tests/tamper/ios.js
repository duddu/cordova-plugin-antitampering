'use strict';

/* eslint no-console: 0, no-process-env: 0 */

var fs = require('fs');
var path = require('path');

var indexAsset = path.join(process.env.IOS_BUILD_DIR, 'HelloWorld.app/www/index.html');
var content;

try {
    content = fs.readFileSync(indexAsset, 'utf-8');
} catch (e) {
    throw new Error('Unable to read original index.html from ios app', e);
}

var tamperedContent = content.replace(/<h1>(.+)<\/h1>/, function (match, group) {
    var result = match.replace(group, '<strike>' + group + '</strike>');
    return result + '<h3 id="tampering">I\'ve been tampered with!</h3>';
});

try {
    fs.writeFileSync(indexAsset, tamperedContent, 'utf-8');
    console.log('The original ios build was successfully tampered with.');
} catch (e) {
    throw new Error('Unable to write over index.html in ios app', e);
}
