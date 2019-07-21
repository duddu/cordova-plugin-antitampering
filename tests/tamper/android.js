'use strict';

/* eslint no-console: 0, no-process-env: 0 */

var fs = require('fs');
var path = require('path');
var JSZip = require('jszip');

var apk;
var indexAsset = 'assets/www/index.html';
var platformPath = path.join(process.env.ANTITAMPERING_TEST_DIR, 'platforms/android');
var pristineApkPath = path.join(process.env.TRAVIS_BUILD_DIR, 'tests/android.apk');
var tamperedApkPath = path.join(process.env.TRAVIS_BUILD_DIR, 'tests/android-tampered.apk');

new JSZip.external.Promise(function (resolve, reject) {
    var buildPath = path.join(platformPath, 'app/build/outputs/apk/debug/app-debug.apk');
    fs.readFile(buildPath, function (_err, _data) {
        if (!_err) {
            resolve({path: buildPath, data: _data});
        } else {
            buildPath = path.join(platformPath, 'build/outputs/apk/android-debug.apk');
            fs.readFile(buildPath, function (err, data) {
                if (!err) {
                    resolve({path: buildPath, data: data});
                } else {
                    reject(err);
                }
            });
        }
    });
})
    .then(function (result) {
        fs.copyFileSync(result.path, pristineApkPath);
        return JSZip.loadAsync(result.data);
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
