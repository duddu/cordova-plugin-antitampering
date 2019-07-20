var helpers = require('./');

module.exports = function (platform) {
    var path = require('path');
    var fs = require('fs');
    var cordovaUtil = this.requireCordovaModule('cordova-lib/src/cordova/util');
    var projectRoot = cordovaUtil.isCordova();
    var platformPath = path.join(projectRoot, 'platforms', platform);
    var pluginDir;
    var sourceFile;
    var content;

    if (platform === 'android') {
        var isHandlingPreferences = this.scriptLocation.indexOf('handle_plugin_preferences') > -1;
        var fileBasename = isHandlingPreferences ? 'AntiTamperingPlugin' : 'AssetsIntegrity';
        var filePath = 'com/duddu/antitampering/' + fileBasename + '.java';
        try {
            sourceFile = path.join(platformPath, 'app/src/main/java', filePath);
            content = fs.readFileSync(sourceFile, 'utf-8');
        } catch (_e) {
            try {
                sourceFile = path.join(platformPath, 'src', filePath);
                content = fs.readFileSync(sourceFile, 'utf-8');
            } catch (e) {
                helpers.exit('Unable to read java class source at path ' + sourceFile, e);
            }
        }
    }

    if (platform === 'ios') {
        var projectName;
        try {
            var IosPlatformApi = require(path.join(platformPath, 'cordova/Api'));
            var locations = (new IosPlatformApi()).locations;
            projectName = locations.xcodeCordovaProj;
        } catch (e) {
            var IosParser = this.requireCordovaModule('cordova-lib/src/cordova/metadata/ios_parser');
            var iosParser = new IosParser(platformPath);
            projectName = iosParser.cordovaproj;
        }
        pluginDir = path.join(projectName, 'Plugins', this.opts.plugin.id);
        sourceFile = path.join(pluginDir, 'AntiTamperingPlugin.m');
        try {
            content = fs.readFileSync(sourceFile, 'utf-8');
        } catch (e) {
            helpers.exit('Unable to read obj-c source at path ' + sourceFile, e);
        }
    }

    return {
        content: content,
        path: sourceFile
    };
};
