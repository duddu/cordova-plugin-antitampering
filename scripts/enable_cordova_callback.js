#!/usr/bin/env node

module.exports = function (context) {
    var path = context.requireCordovaModule('path');
    var fs = context.requireCordovaModule('fs');
    var cordovaUtil = context.requireCordovaModule('cordova-lib/src/cordova/util');
    var projectRoot = cordovaUtil.isCordova();
    var pluginInfo = context.opts.plugin.pluginInfo;
    var platforms = context.opts.platforms || context.opts.cordova.platforms;

    function getCallbackPreference (platform) {
        var platformConfigPath = path.join(projectRoot, 'platforms', platform, platform + '.json');
        var platformConfig = require(platformConfigPath);
        var callbackPreference = platformConfig.installed_plugins[pluginInfo.id].ENABLE_CORDOVA_CALLBACK;
        return String(callbackPreference) === 'true';
    }

    platforms.filter(function (platform) {
        return pluginInfo.getPlatformsArray().indexOf(platform) > -1;
    }).forEach(function (platform) {
        var platformPath = path.join(projectRoot, 'platforms', platform);
        var pluginDir;
        var sourceFile;
        var content;

        if (!getCallbackPreference(platform)) {
            return;
        }

        process.stdout.write('[ANTI-TAMPERING] Enabling cordova callback for ' + platform + '\n');

        if (platform === 'android') {
            pluginDir = path.join(platformPath, 'src');
            sourceFile = path.join(pluginDir, 'com/duddu/antitampering/AntiTamperingPlugin.java');
            try {
                content = fs.readFileSync(sourceFile, 'utf-8');
            } catch (e) {
                exit('Unable to read java class source at path ' + sourceFile, e);
            }

            content = content.replace(/.*checkAndStopExecution\(\);[\r\n]*/, '');

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

            content = content.replace(/.*\[self checkAndStopExecution\];[\n\r]*/, '')
                .replace(/-\(void\)checkAndStopExecution\{[\S\s]*\}\s*-/, '-');

            try {
                fs.writeFileSync(sourceFile, content, 'utf-8');
            } catch (e) {
                exit('Unable to write obj c source at path ' + sourceFile, e);
            }
        }
    });

    function exit (msg, exception) {
        process.stdout.write('\n[ANTI-TAMPERING] ERROR! ' + msg + '\n');
        throw new Error(exception);
    }
};
