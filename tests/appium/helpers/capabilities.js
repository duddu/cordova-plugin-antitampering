'use strict';

/* eslint no-process-env: 0, max-len: 0 */

var defaults = {
    browserName: '',
    appiumVersion: process.env.PLATFORM === 'ios' && Number(process.env.PLATFORM_VERS) < 12 ? '1.9.1' : '1.12.1',
    deviceOrientation: 'portrait',
    platformVersion: process.env.PLATFORM_VERS,
    app: 'sauce-storage:' + process.env.TRAVIS_JOB_ID + '-' + process.env.PLATFORM + '.' + process.env.PACKAGE_EXT,
    name: 'AntiTampering - ' + process.env.PLATFORM + ' ' + process.env.PLATFORM_VERS,
    tags: ['cordova-plugin-antitampering'],
    tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
};

exports.android = Object.assign({
    deviceName: 'Android GoogleAPI Emulator',
    platformName: 'Android'
}, defaults);

exports.ios = Object.assign({
    deviceName: 'iPhone Simulator',
    platformName: 'iOS'
}, defaults);
