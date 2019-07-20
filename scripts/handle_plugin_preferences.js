#!/usr/bin/env node

var helpers = require('./helpers');

module.exports = function (context) {
    var fs = require('fs');
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
        var source = helpers.getPluginSource(context, platform);
        var content = source.content;

        if (callbackPreference) {
            process.stdout.write('[ANTI-TAMPERING] Enabling cordova callbacks for ' + platform + '\n');
        }
        if (debugPreference) {
            process.stdout.write('[ANTI-TAMPERING] Enabling debug detection for ' + platform + '\n');
        }

        if (platform === 'android') {
            if (callbackPreference) {
                content = content.replace(/.*checkAndStopExecution\(\);[\r\n]*/, '');
            }
            if (!debugPreference) {
                content = content.replace(/.*DebugDetection\..+;[\r\n]*/g, '');
            }

            try {
                fs.writeFileSync(source.path, content, 'utf-8');
            } catch (e) {
                helpers.exit('Unable to write java class source at path ' + source.path, e);
            }
        }

        if (platform === 'ios') {
            if (callbackPreference) {
                content = content.replace(/.*\[self checkAndStopExecution\];[\r\n]*/, '');
            }
            if (!debugPreference) {
                content = content.replace(/.*\[self debugDetection\];[\r\n]*/g, '');
            }

            try {
                fs.writeFileSync(source.path, content, 'utf-8');
            } catch (e) {
                helpers.exit('Unable to write obj-c source at path ' + source.path, e);
            }
        }
    });
};
