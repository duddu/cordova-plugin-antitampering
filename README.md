Anti-Tampering Cordova Plugin
=============================

[![npm](https://img.shields.io/npm/v/cordova-plugin-antitampering.svg)](https://www.npmjs.com/package/cordova-plugin-antitampering)
[![Travis branch](https://img.shields.io/travis/duddu/cordova-plugin-antitampering/master.svg)](https://travis-ci.org/duddu/cordova-plugin-antitampering)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/596be7addc734ba9979e66713d237052)](https://www.codacy.com/app/duddu/cordova-plugin-antitampering?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=duddu/cordova-plugin-antitampering&amp;utm_campaign=Badge_Grade)

This plugin verifies the **integrity of the static assets** of your Cordova application, checking if the files have changed since the original build.  
Before the compile phase, it creates a hash (SHA-256) for each file found under the `www` directory of your platforms; then, every time the app is launched, it compares those hashes with ones created at run-time from the actual assets loaded.  
The plugin also provides optional **debug detection**, to prevent your App from running in debug mode.  

Supports Android and iOS.

## Installation

Install latest release from npm:

    cordova plugin add cordova-plugin-antitampering

Install latest commit from branch develop:

    cordova plugin add https://github.com/duddu/cordova-plugin-antitampering#develop

## Usage

### Default behaviour

By default (since v0.1.0), if a tampering is detected on one of the assets **the plugin will make the app crash**, as a mean of defense, in order to stop the alleged attacker from keep playing.  
This behaviour is achieved
- on Android: throwing a `SecurityException` that immediately terminates the app
- on iOS: causing a `BAD ACCESS` that brings the app to crash (welcome to any better idea)

If you don't want this to happen, or you need to have more control over the check result, keep reading.

### Call the plugin from JavaScript

You can disable the standard behaviour, and run the anti-tampering check manually from JavaScript, in order to get the result of the check from cordova callbacks. Obviously, this is less secure than the default behaviour, since it keeps the app running after tampering detected (I do not recommend it in production).  
To run the check from JavaScript, install the plugin with the `ENABLE_CORDOVA_CALLBACK` preference (aka variable):

    cordova plugin add cordova-plugin-antitampering --variable ENABLE_CORDOVA_CALLBACK=true --save

If you set the variable to `false` (or any other value than `true`), the plugin will keep the standard behaviour.  
By setting this variable to `true`, you tell the plugin to skip the automatic check on app launch, and so you are free to do it whenever you want from JavaScript.  
For this purpose, the plugin exports a method which you can call like this:

    window.cordova.plugins.AntiTampering.verify(
        function (success) {
            console.info(success);
            // {"assets": {"count": x}} - where x is the number of assets checked
        },
        function (error) {
            console.error(error);
            // gives you the file on which tampering was detected
        }
    );

If you are using **AngularJS** (eg with Ionic), you can use the angular service `$antitampering` provided with the plugin; it has a `verify` method that returns a promise. Remember to require the plugin's module `duddu.antitampering` first:

    var app = angular.module('myApproximatelySecureApp', ['duddu.antitampering']);

    app.run(['$antitampering', function ($antitampering) {
        $antitampering.verify().then(function (success) {
            console.info(success);
        }, function (error) {
            console.error(error);
        });
    }]);

### Exclude assets by extensions

By default (since v0.2.0), the integrity check run against all the assets found. You can choose to manually exclude some of your assets, providing their extension with the `EXCLUDE_ASSETS_EXTENSIONS` variable while installing the plugin. E.g. to exclude all the fonts assets:

    cordova plugin add cordova-plugin-antitampering --variable EXCLUDE_ASSETS_EXTENSIONS="ttf, eot, svg, woff, woff2" --save

The value of this variable should be a list of extensions, separated by comma or space. 

### Debug Detection

Optional debug detection can be enabled using the `ENABLE_DEBUG_DETECTION` variable (default `false`) while installing the plugin:

    cordova plugin add cordova-plugin-antitampering --variable ENABLE_DEBUG_DETECTION=true --save

If enabled (i.e. for release builds in production), the plugin also verifies - before any other check - that the app is not running in debug mode / doesn't have a debugger attached. As for the assets integrity check, if this check fails the app will crash (or return an error message on javascript callback, if `ENABLE_CORDOVA_CALLBACK=true`). 

## Additional info

- The plugin recursively searches for files within the `www` directory of each platform (i.e. cordova assets); no other directory is considered.
- The files hashes (against which the assets are validated) are created at `before_compile`. I chose this hook since there are several plugins which changes the content (or hierarchy) of the assets during the `prepare` phase, and the integrity check must be run on the final version of the assets.
- As a consequence of the previous point, the check is effective only when you compile your project using the command `cordova build` (or `prepare`+`compile`), not for the `run` command.

## Security warning

This plugin can't be considered as an exhaustive integrity check for your app: an app can always be tampered somehow. Remember to protect any sensitive logic, obfuscate your Java source for Android, prevent your app to be debuggable, and consider to encrypt your static assets.

## Todo

- Add a check for the version, versionCode, and package name of the app
- Add a check for the signing certificate
- Add support for server-side integrity validation

## Contributing

Any suggestions, remarks, or pull requests are welcome!

If you want to contribute: fork the repo, create a new branch, and submit a PR *to the develop branch* of this repo. I will merge into develop, and then into master on the next release tag.

The plugin is tested (thanks to Travis CI) on **Cordova versions from 5 to 9**, on both Android and iOS platforms.