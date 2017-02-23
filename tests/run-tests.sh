#!/bin/bash
set -e

cordova create tests/hello com.example.hello HelloWorld
cd tests/hello
# cordova platform add android@5.2.2 --save
cordova platform add android --save
# cordova platform add ios@4.2.1 --save
cordova platform add ios --save
cordova plugin add ../../ --variable ENABLE_CORDOVA_CALLBACK=true --save
cordova plugin list
cordova prepare

if [[ "$PLATFORM" == "Android" ]]; then

    # echo y | android update sdk -u -a --dry-mode
    # echo y | android update sdk --no-ui --filter tools --dry-mode
    # echo y | $ANDROID_HOME/tools/android update sdk -u -a -t tools,android-23,build-tools-23.0.1

    cordova compile --debug android -verbose
    npm run android-tamper

    jarsigner -verbose -keystore $HOME/.android/debug.keystore -storepass android -keypass android $TRAVIS_BUILD_DIR/tests/android-tampered.apk androiddebugkey

    curl -u $SAUCE_USERNAME:$SAUCE_ACCESS_KEY -X POST -H "Content-Type:application/octet-stream" https://saucelabs.com/rest/v1/storage/duddu/$TRAVIS_JOB_ID-android.apk?overwrite=true --data-binary @$TRAVIS_BUILD_DIR/tests/android-tampered.apk
    npm run android-test

fi

if [[ "$PLATFORM" == "iOS" ]]; then

    cordova compile --debug ios -verbose
    npm run ios-tamper

    cd platforms/ios/build/emulator
    zip -r $TRAVIS_BUILD_DIR/tests/ios-tampered.zip HelloWorld.app
    cd $TRAVIS_BUILD_DIR

    curl -u $SAUCE_USERNAME:$SAUCE_ACCESS_KEY -X POST -H "Content-Type:application/octet-stream" https://saucelabs.com/rest/v1/storage/duddu/$TRAVIS_JOB_ID-ios.zip?overwrite=true --data-binary @$TRAVIS_BUILD_DIR/tests/ios-tampered.zip
    npm run ios-test

fi

# TODO skip when commit is a release merge into develop