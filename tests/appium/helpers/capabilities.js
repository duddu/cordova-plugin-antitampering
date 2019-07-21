'use strict';

/* eslint no-process-env: 0 */

var getAppName = function (isNegativeTest) {
    return 'sauce-storage:' + process.env.TRAVIS_JOB_ID +
        '-' + process.env.PLATFORM +
        (isNegativeTest ? '' : '-tamper') +
        '.' + process.env.PACKAGE_EXT;
};

var getCapabilityName = function (isNegativeTest) {
    return '[AntiTampering - ' + (isNegativeTest ? 'negative' : 'positive') +
        '] cordova ' + process.env.CORDOVA_VERS + ' - ' +
        process.env.PLATFORM + ' ' + process.env.PLATFORM_VERS;
};

var getDefaults = function (isNegativeTest) {
    return {
        browserName: '',
        autoWebview: true,
        appiumVersion: process.env.PLATFORM === 'ios' && Number(process.env.PLATFORM_VERS) < 12 ? '1.9.1' : '1.12.1',
        deviceOrientation: 'portrait',
        platformVersion: process.env.PLATFORM_VERS,
        app: getAppName(isNegativeTest),
        name: getCapabilityName(isNegativeTest),
        tags: ['cordova-plugin-antitampering'],
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    };
};

var getAndroid = function (isNegativeTest) {
    return Object.assign({
        deviceName: 'Android GoogleAPI Emulator',
        platformName: 'Android'
    }, getDefaults(isNegativeTest));
};

var getIos = function (isNegativeTest) {
    return Object.assign({
        deviceName: 'iPhone Simulator',
        platformName: 'iOS',
        webviewConnectRetries: 20
    }, getDefaults(isNegativeTest));
};

exports.android = {
    negative: getAndroid(true),
    positive: getAndroid(false)
};

exports.ios = {
    negative: getIos(true),
    positive: getIos(false)
};
