Anti-Tampering Cordova Plugin
=============================

This plugin verifies the integrity of the static assets of your Cordova application, checking if the files have changed since the original build.  
During the build phase, it creates an hash (SHA-256) for each file found under the `www` directory of your project; then, every time the app is launched, it compares those hashes with ones created at run-time from the actual assets loaded.  

Supports Android and iOS.

## Installation

Install latest version from npm:

    cordova plugin add cordova-plugin-antitampering

Install latest commit from branch develop:

    cordova plugin add https://github.com/duddu/cordova-plugin-antitampering#develop

## Usage

### Default behaviour

By default (since v0.1.0), if a tampering is detected on one of the assets **the plugin will make the app *crash***, as a mean of defense, in order to stop the alleged attacker from keep playing.  
This behaviour is achieved
- on Android: throwing a `SecurityException` that immediately terminates the app
- on iOS: giving a `BAD ACCESS` that brings the app to crash (welcome to any better idea)

If you don't want this to happen, or you need to have more control over the check result, keep reading.

### Call the plugin from JavaScript

You can disable the standard behaviour, and run the anti-tampering check manually from JavaScript, in order to get the result of the check from cordova callbacks.  
You simply have to specify the `ENABLE_CORDOVA_CALLBACK` plugin preference (aka variable):

    cordova plugin add cordova-plugin-antitampering --variable ENABLE_CORDOVA_CALLBACK=true --save

If you set the variable to `false` or any other value than `true`, the plugin will keep the standard behaviour.  
By setting this variable to `true`, you tell the plugin to skip the automatic anti-tampering check on app launch, and so you are free to do it whenever you want from JavaScript.  
For that, the plugin exports a method which you can call like this:

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

If you are using **AngularJS** (maybe Ionic), you can use the angular service `$antitampering` provided with the plugin; it has a `verify` method that returns a promise. Remember to require the plugin's module `duddu.antitampering` first:

    var app = angular.module('myApproximatelySecureApp', ['duddu.antitampering']);

    app.run(['$antitampering', function ($antitampering) {
        $antitampering.verify().then(function (success) {
            console.info(success);
        }, function (error) {
            console.error(error);
        });
    }]);

Remember: if you put in your code the JavaScript/Angular call without setting the aforesaid variable, the check will be done at app launch.

## Additional info

- For now, the plugin only verifies the integrity of assets having the following **extensions**: `js|html|htm|css`, but this behaviour will be probably changed very soon.
- The plugin recursively searches for files within the `www` directory (i.e. cordova assets); no other directory is considered.
- The files hashes (through which the files are validated) are created at `before_compile`. I chose this hook because there are many plugin which changes the content (or hierarchy) of the assets during the `prepare` phase, and the integrity check must be run on the latest version of the assets.

## Security warning

This plugin can't be considered as an exhaustive integrity check for your app: an app can always be tampered somehow. Remember to protect your http communications, obfuscate your Java source for Android, prevent your app to be debuggable, and consider to encrypt your static assets.

## To do

- Test!
- Better handling of the assets filter (remove the hard-coded extensions regex)
- Add a check for the version, versionCode, and package name of the app
- Add a check for the signing certificate

## Contributing

Any suggestions, remarks, or pull requests are welcome!

If you want to submit a PR: fork the repo, create a new branch, and submit a PR *to the develop branch* of this repo. I will merge into develop, and then merge into master on the next release. 

Please make sure your code passes ESLint validation with the `.eslintrc` provided.