#!/usr/bin/env node

var crypto = require('crypto');
var helpers = require('./helpers');

module.exports = function (context) {
    var path = require('path');
    var fs = require('fs');
    var cordovaUtil = context.requireCordovaModule('cordova-lib/src/cordova/util');
    var platforms = context.requireCordovaModule('cordova-lib/src/platforms/platforms');
    var projectRoot = cordovaUtil.isCordova();
    var excludeExts = getExtensionsPreference();

    process.stdout.write('[ANTI-TAMPERING] Saving a hash for each platforms asset \n');

    function getExtensionsPreference () {
        var extensionsPref = helpers.getPluginPreference(context, 'EXCLUDE_ASSETS_EXTENSIONS');
        if (typeof extensionsPref !== 'string' || !extensionsPref.trim().length) {
            if (helpers.isVerbose(context)) {
                process.stdout.write('No extensions to exclude provided \n');
            }
            return false;
        }
        var extensions = [];
        extensionsPref.split(/\s+|,+/).forEach(function (ext) {
            if (ext !== '') {
                extensions.push(ext);
            }
        });
        if (helpers.isVerbose(context)) {
            process.stdout.write('Excluding following extensions: ' + extensions.join(',') + ' \n');
        }
        if (!extensions.length) {
            return null;
        }
        return new RegExp('.*\.(' + extensions.join('|') + ')$');
    }

    function getPlatformAssets (dir) {
        var assetsList = [];
        var list = fs.readdirSync(dir);
        list.map(function (file) {
            var filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                var subDirList = getPlatformAssets(filePath, excludeExts);
                assetsList = assetsList.concat(subDirList);
            }
            if (fs.statSync(filePath).isFile() && (!excludeExts || !excludeExts.test(file))) {
                assetsList.push(filePath);
            }
        });
        return assetsList;
    }

    helpers.getPlatformsList(context).forEach(function (platform) {
        var platformPath = path.join(projectRoot, 'platforms', platform);
        var platformApi = platforms.getPlatformApi(platform, platformPath);
        var platformInfo = platformApi.getPlatformInfo();
        var platformWww = platformInfo.locations.www;
        var source = helpers.getPluginSource(context, platform);
        var content = source.content;

        var hashes = getPlatformAssets(platformWww).map(function (file) {
            var fileName = file.replace(/\\/g, '/');
            fileName = fileName.replace(platformWww.replace(/\\/g, '/') + '/', '');
            var hash;
            var hashHex;
            hash = crypto.createHash('sha256');
            try {
                hash.update(fs.readFileSync(file), 'utf8');
            } catch (e) {
                helpers.exit('Unable to read file at path ' + file, e);
            }
            hashHex = hash.digest('hex');
            if (helpers.isVerbose(context)) {
                process.stdout.write('Hash: ' + hashHex + ' < ' + fileName + '\n');
            }
            return {
                file: Buffer.from(fileName).toString('base64'),
                hash: hashHex
            };
        });

        if (platform === 'android') {
            content = content.replace(/\s*put\("[^"]+",\s"[^"]{64}"\);/g, '')
                .replace(/assetsHashes\s*=.+\s*new.*(\(\d+\)[^\w]*)\);/, function (match, group) {
                    return match.replace(group, '()\n' + tab());
                })
                .replace(/assetsHashes\s*=.+\s*new.*(\(.*\))/, function (match, group) {
                    var replace = match.replace(group, '(' + (hashes.length || '') + ')');
                    if (hashes.length) {
                        replace += ' {{\n' + tab();
                        hashes.forEach(function (h) {
                            replace += tab(2) + 'put("' + h.file + '", "' + h.hash + '");\n' + tab();
                        });
                        replace += tab() + '}}';
                    }
                    return replace;
                });

            try {
                fs.writeFileSync(source.path, content, 'utf-8');
            } catch (e) {
                helpers.exit('Unable to write java class source at path ' + source.path, e);
            }
        }

        if (platform === 'ios') {
            content = content.replace(/assetsHashes = (@{([^}]*)});/, function (a, b) {
                var list = '@{\n' + tab();
                hashes.forEach(function (h) {
                    list += tab() + '@"' + h.file + '": @"' + h.hash + '",\n' + tab();
                });
                list += '}';
                return a.replace(b, list);
            });

            try {
                fs.writeFileSync(source.path, content, 'utf-8');
            } catch (e) {
                helpers.exit('Unable to write obj-c source at path ' + source.path, e);
            }
        }
    });

    function tab (size) {
        var str = '';
        for (var i = 0; i < (size || 1); i++) {
            str += '    ';
        }
        return str;
    }
};
