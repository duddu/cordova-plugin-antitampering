# Changelog

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