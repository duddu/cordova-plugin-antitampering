'use strict';

/* eslint no-console: 0, no-process-env: 0 */

var fs = require('fs');
var path = require('path');
var JSZip = require('jszip');

var apk;
var indexAsset = 'assets/www/index.html';
var basePath = path.join(process.env.TRAVIS_BUILD_DIR, 'tests');
var originalApkPath = path.join(basePath, 'hello/platforms/android/build/outputs/apk/android-debug.apk');
var tamperedApkPath = path.join(basePath, 'android-tampered.apk');

new JSZip.external.Promise(function (resolve, reject) {
    var build = originalApkPath;
    fs.readFile(build, function (err, data) {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
})
.then(function (data) {
    return JSZip.loadAsync(data);
})
.then(function (zip) {
    apk = zip;
    var index = apk.file(indexAsset);
    if (!index) {
        throw new Error('Can\'t find index.html asset in apk');
    }
    return index.async('string');
})
.then(function (content) {
    var tamperedContent = content.replace(/<h1>(.+)<\/h1>/, function (match, group) {
        var result = match.replace(group, '<strike>' + group + '</strike>');
        return result + '<h3 id="tampering">I\'ve been tampered with!</h3>';
    });
    apk.file(indexAsset, tamperedContent).remove('META-INF');
    console.log('The original android build was successfully tampered with.');
    apk.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(tamperedApkPath))
        .on('finish', function () {
            console.log('New unsigned apk was created at ' + tamperedApkPath);
        });
})
.catch(function (err) {
    setTimeout(function () {
        throw err;
    });
});
