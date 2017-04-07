#!/usr/bin/env node

var helpers = require('./helpers');

module.exports = function (context) {
    var path = context.requireCordovaModule('path');
    var fs = context.requireCordovaModule('fs');
    var cordovaUtil = context.requireCordovaModule('cordova-lib/src/cordova/util');
    var projectRoot = cordovaUtil.isCordova();
    var callbackPreference = getPreference('ENABLE_CORDOVA_CALLBACK');
    var debugPreference = getPreference('ENABLE_DEBUG_DETECTION');

    if (helpers.isVerbose(context)) {
        process.stdout.write('[ANTI-TAMPERING] Preferences: ');
        process.stdout.write('enable_cordova_callback=' + callbackPreference + ', ');
        process.stdout.write('enable_debug_detection=' + debugPreference + '\n');
    }

    function getPreference (preference) {
        var value = helpers.getPluginPreference(context, preference);
        return String(value) === 'true';
    }

    helpers.getPlatformsList(context).forEach(function (platform) {
        var platformPath = path.join(projectRoot, 'platforms', platform);
        var pluginDir;
        var sourceFile;
        var content;

        if (callbackPreference) {
            process.stdout.write('[ANTI-TAMPERING] Enabling cordova callbacks for ' + platform + '\n');
        }
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
