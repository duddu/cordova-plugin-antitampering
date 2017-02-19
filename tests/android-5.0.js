'use strict';

/* eslint no-console: 0, no-process-env: 0 */

var wd = require('wd');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
require('colors');

chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

var logging = function (driver) {
    driver.on('status', function (info) {
        console.log(info.cyan);
    });
    driver.on('command', function (meth, path, data) {
        console.log(' > ' + meth.yellow, path.grey, data || '');
    });
    driver.on('http', function (meth, path, data) {
        console.log(' > ' + meth.magenta, path, (data || '').grey);
    });
};

var antiTamperingTest = function (callback) {
    return cordova.plugins.AntiTampering.verify(function (success) {
        callback('succes -> ' + JSON.stringify(success));
    }, function (error) {
        callback('error -> ' + JSON.stringify(error));
    });
};

describe('AntiTampering Plugin Test', function () {
    this.timeout(300000);
    var driver;
    var allPassed = true;

    before(function () {
        var serverConfig = {
            protocol: 'https',
            host: 'ondemand.saucelabs.com',
            port: 443,
            auth: process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY
        };
        driver = wd.promiseChainRemote(serverConfig);
        logging(driver);

        return driver
            .init({
                browserName: '',
                appiumVersion: '1.5.3',
                deviceName: 'Android Emulator',
                deviceOrientation: 'portrait',
                platformVersion: '5.0',
                platformName: 'Android',
                app: 'sauce-storage:' + process.env.COMMIT_HASH + '.apk',
                name: 'AntiTampering - Android 5.0',
                tags: ['cordova-plugin-antitampering'],
                tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
            })
            .setImplicitWaitTimeout(3000);
    });

    after(function () {
        return driver
            .quit()
            .finally(function () {
                return driver.sauceJobStatus(allPassed);
            });
    });

    afterEach(function () {
        allPassed = allPassed && this.currentTest.state === 'passed';
    });

    it('should be tampered', function () {
        return driver
            .contexts().then(function (contexts) {
                console.log(contexts);
                return driver.context(contexts[1]);
            })
            .setAsyncScriptTimeout(10000)
            .executeAsync(antiTamperingTest, [])
            .then(function (result) {
                return result;
            });
    });
});
