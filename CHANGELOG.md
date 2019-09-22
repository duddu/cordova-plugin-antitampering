# Changelog

## v0.4.2

- Updated npm dev dependencies

## v0.4.1

- CI: add negative tests
- CI: refactor mocha tests structure and appium capabilities

## v0.4.0

- Fix plugin support for Cordova 9
- CI: added more tests for multiple version of Node and Cordova

## v0.3.0

- Fix plugin support for Cordova 7 and 8
- CI: added multiple tests for major Cordova versions on both iOS and Android

## v0.2.2

- Added some helpers functions for hooks scripts
- Plugin preferences explicitly set in config.xml take precedence over first-install variables

## v0.2.1

- Added ENABLE_DEBUG_DETECTION preference to prevent debuggable builds

## v0.2.0

- **BREAKING CHANGE**: All assets are now validated by default
- Added EXCLUDE_ASSETS_EXTENSIONS preference to exclude assets from tampering check

## v0.1.2

- Fixed bug in hooks regex to clear the previous build hashes
- CI: new builds trigger an anti-tampering test on Sauce Labs emulators

## v0.1.1

- Added "onload" feature param to force the plugin instantiation
- Added travis ci integration for eslint test
- Updated README

## v0.1.0

- **BREAKING CHANGE**: If tampering is detected, now the app will stop the execution by default
- Added ENABLE_CORDOVA_CALLBACK plugin preference
- Updated README

## v0.0.3

- iOS: Aligned success callback response dictionary
- Android: Brought anti-tampering logic outside the main plugin class
- Android: Removed some logs

## v0.0.2

- Fixed assets paths handling in node hooks on Windows

## v0.0.1

- Initial release
