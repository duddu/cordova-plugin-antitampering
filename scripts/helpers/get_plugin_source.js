var helpers = require('./');

module.exports = function (platform) {
    var path = this.requireCordovaModule('path');
    var fs = this.requireCordovaModule('fs');
    var cordovaUtil = this.requireCordovaModule('cordova-lib/src/cordova/util');
    var projectRoot = cordovaUtil.isCordova();
    var platformPath = path.join(projectRoot, 'platforms', platform);
    var pluginDir;
    var isHandlingPreferences;
    var fileBasename;
    var sourceFile;
    var content;

    if (platform === 'android') {
        pluginDir = path.join(platformPath, 'src');
        isHandlingPreferences = this.scriptLocation.indexOf('handle_plugin_preferences') > -1;
        fileBasename = isHandlingPreferences ? 'AntiTamperingPlugin' : 'AssetsIntegrity';
        sourceFile = path.join(pluginDir, 'com/duddu/antitampering/' + fileBasename + '.java');
        try {
            content = fs.readFileSync(sourceFile, 'utf-8');
        } catch (e) {
            helpers.exit('Unable to read java class source at path ' + sourceFile, e);
        }
    }

    if (platform === 'ios') {
        try {
            var IosParser = this.requireCordovaModule('cordova-lib/src/cordova/metadata/ios_parser');
            var iosParser = new IosParser(platformPath);
            pluginDir = path.join(iosParser.cordovaproj, 'Plugins', this.opts.plugin.id);

            process.stdout.write('\n[ANTI-TAMPERING] pluginDir: ' + pluginDir + '\n');
        } catch (e) {
            //
        }
        var IosPlatformApi = require(path.join(platformPath, '/cordova/Api'));
        var locations = (new IosPlatformApi()).locations;
        process.stdout.write('\n[ANTI-TAMPERING] locations.xcodeProjDir: ' + locations.xcodeProjDir + '\n');
        process.stdout.write('\n[ANTI-TAMPERING] locations.xcodeCordovaProj: ' + locations.xcodeCordovaProj + '\n');

        pluginDir = path.join(locations.xcodeCordovaProj, 'Plugins', this.opts.plugin.id);
        process.stdout.write('\n[ANTI-TAMPERING] pluginDir hard: ' + pluginDir + '\n');

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
