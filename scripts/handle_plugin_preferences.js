#!/usr/bin/env node

module.exports = function (context) {
    var path = context.requireCordovaModule('path');
    var fs = context.requireCordovaModule('fs');
    var cordovaUtil = context.requireCordovaModule('cordova-lib/src/cordova/util');
    var projectRoot = cordovaUtil.isCordova();
    var pluginInfo = context.opts.plugin.pluginInfo;
    var platforms = context.opts.platforms || context.opts.cordova.platforms;
    var pluginConfigs = {};

    function getPreference (preference, platform) {
        if (!pluginConfigs[platform]) {
            var platformConfigPath = path.join(projectRoot, 'platforms', platform, platform + '.json');
            var platformConfig = require(platformConfigPath);
            try {
                pluginConfigs[platform] = platformConfig.installed_plugins[pluginInfo.id];
            } catch (e) {
                exit('Plugin ' + pluginInfo.id + ' not found in ' + platform + '.json', e);
            }
        }
        var value = pluginConfigs[platform][preference];
        return String(value) === 'true';
    }

    platforms.filter(function (platform) {
        return pluginInfo.getPlatformsArray().indexOf(platform) > -1;
    }).forEach(function (platform) {
        var platformPath = path.join(projectRoot, 'platforms', platform);
        var pluginDir;
        var sourceFile;
        var content;

        var callbackPreference = getPreference('ENABLE_CORDOVA_CALLBACK', platform);
        if (callbackPreference) {
            process.stdout.write('[ANTI-TAMPERING] Enabling cordova callback for ' + platform + '\n');
        }
        var debugPreference = getPreference('ENABLE_DEBUG_DETECTION', platform);
        if (debugPreference) {
            process.stdout.write('[ANTI-TAMPERING] Enabling debug detection for ' + platform + '\n');
        }

        if (platform === 'android') {
            pluginDir = path.join(platformPath, 'src');
            sourceFile = path.join(pluginDir, 'com/duddu/antitampering/AntiTamperingPlugin.java');
            try {
                content = fs.readFileSync(sourceFile, 'utf-8');
            } catch (e) {
                exit('Unable to read java class source at path ' + sourceFile, e);
            }

            if (callbackPreference) {
                content = content.replace(/.*checkAndStopExecution\(\);[\r\n]*/, '');
            }
            if (!debugPreference) {
                content = content.replace(/.*DebugDetection\..+;[\r\n]*/g, '');
            }

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

            if (callbackPreference) {
                content = content.replace(/.*\[self checkAndStopExecution\];[\r\n]*/, '');
            }
            if (!debugPreference) {
                content = content.replace(/.*\[self debugDetection\];[\r\n]*/g, '');
            }

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
