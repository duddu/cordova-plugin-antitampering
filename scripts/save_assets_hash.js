#!/usr/bin/env node

var crypto = require('crypto');

module.exports = function (context) {
    var path = context.requireCordovaModule('path');
    var fs = context.requireCordovaModule('fs');
    var cordovaUtil = context.requireCordovaModule('cordova-lib/src/cordova/util');
    var projectRoot = cordovaUtil.isCordova();
    var pluginInfo = context.opts.plugin.pluginInfo;

    process.stdout.write('[ANTI-TAMPERING] Saving a hash for each platforms asset \n');

    function getPlatformAssets (dir) {
        var assetsList = [];
        var list = fs.readdirSync(dir);
        list.filter(function (file) {
            return fs.statSync(path.join(dir, file)).isFile() &&
            /.*\.(js|html|htm|css)$/.test(file);
        }).forEach(function (file) {
            assetsList.push(path.join(dir, file));
        });
        list.filter(function (file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        }).forEach(function (file) {
            var subDir = path.join(dir, file);
            var subFileList = getPlatformAssets(subDir);
            assetsList = assetsList.concat(subFileList);
        });
        return assetsList;
    }

    context.opts.platforms.filter(function (platform) {
        return pluginInfo.getPlatformsArray().indexOf(platform) > -1;
    }).forEach(function (platform) {
        var platforms = context.requireCordovaModule('cordova-lib/src/platforms/platforms');
        var platformPath = path.join(projectRoot, 'platforms', platform);
        var platformApi = platforms.getPlatformApi(platform, platformPath);
        var platformInfo = platformApi.getPlatformInfo();
        var platformWww = platformInfo.locations.www;
        var pluginDir;
        var sourceFile;
        var content;

        var hashes = getPlatformAssets(platformWww).map(function (file) {
            var fileName = file.replace(/\\/g, '/');
            fileName = fileName.replace(platformWww.replace(/\\/g, '/') + '/', '');
            var hash;
            var hashHex;
            hash = crypto.createHash('sha256');
            try {
                hash.update(fs.readFileSync(file, 'utf-8'), 'utf8');
            } catch (e) {
                exit('Unable to read file at path ' + file, e);
            }
            hashHex = hash.digest('hex');
            if (context.opts.options.verbose) {
                process.stdout.write('Hash: ' + hashHex + ' - ' + fileName + '\n');
            }
            return {
                file: new Buffer(fileName).toString('base64'),
                hash: hashHex
            };
        });

        if (platform === 'android') {
            pluginDir = path.join(platformPath, 'src');
            sourceFile = path.join(pluginDir, 'com/duddu/antitampering/AssetsIntegrity.java');
            try {
                content = fs.readFileSync(sourceFile, 'utf-8');
            } catch (e) {
                exit('Unable to read java class source at path ' + sourceFile, e);
            }

            content = content.replace(/\s*put\("[^"]+",\s"[^"]{64}"\);/g, '')
            .replace(/assetsHashes\s*=.+\s*new.*(\(\d+\)[^\w]*)\);/, function (match, group) {
                return match.replace(group, '()\n' + tab());
            })
            .replace(/assetsHashes\s*=.+\s*new.*(\(.*\))/, function (match, group) {
                var replace = match.replace(group, '(' + (hashes.length || '') + ')');
                replace += ' {{\n' + tab();
                hashes.forEach(function (h) {
                    replace += tab(2) + 'put("'+ h.file +'", "'+ h.hash +'");\n' + tab();
                });
                replace += tab() + '}}';
                return replace;
            });

            try {
                fs.writeFileSync(sourceFile, content, 'utf-8');
            } catch (e) {
                exit('Unable to write java class source at path ' + sourceFile, e);
            }
        }

        if (platform === 'ios') {
            var IosParser = context.requireCordovaModule('cordova-lib/src/cordova/metadata/ios_parser');
            var iosParser = new IosParser(platformPath);
            pluginDir = path.join(iosParser.cordovaproj, 'Plugins', context.opts.plugin.id);
            sourceFile = path.join(pluginDir, 'AntiTamperingPlugin.m');
            try {
                content = fs.readFileSync(sourceFile, 'utf-8');
            } catch (e) {
                exit('Unable to read obj-c source at path ' + sourceFile, e);
            }

            content = content.replace(/assetsHashes = (@{([^}]*)});/, function (a, b) {
                var list = '@{\n' + tab();
                hashes.forEach(function (h) {
                    list += tab() + '@"' + h.file + '": @"' + h.hash + '",\n' + tab();
                });
                list += '}';
                return a.replace(b, list);
            });

            try {
                fs.writeFileSync(sourceFile, content, 'utf-8');
            } catch (e) {
                exit('Unable to write obj c source at path ' + sourceFile, e);
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

    function exit (msg, exception) {
        process.stdout.write('\n[ANTI-TAMPERING] ERROR! ' + msg + '\n');
        throw new Error(exception);
    }
};
