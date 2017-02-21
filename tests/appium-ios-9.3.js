'use strict';

/* eslint no-console: 0, no-process-env: 0, no-underscore-dangle: 0 */

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

var getWebViewContext = function (driver) {
    return driver.contexts().then(function (contexts) {
        return driver.context(contexts[1]);
    });
};

var antiTamperingTest = function () {
    window.__tamperingTestResult = void 0;
    cordova.plugins.AntiTampering.verify(function (success) {
        window.__tamperingTestResult = JSON.stringify(success);
    }, function (error) {
        window.__tamperingTestResult = JSON.stringify(error);
    });
};

describe('AntiTampering Plugin Test - iOS', function () {
    this.timeout(1000000);
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
                deviceName: 'iPhone Simulator',
                deviceOrientation: 'portrait',
                platformVersion: '9.3',
                platformName: 'iOS',
                app: 'sauce-storage:' + process.env.COMMIT_HASH + '-ios.zip',
                name: 'AntiTampering - iOS 9.3',
                tags: ['cordova-plugin-antitampering'],
                tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
            })
            .setImplicitWaitTimeout(5000)
            .then(function () {
                return getWebViewContext(driver);
            });
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

    it('The Hello World cordova app should load successfully', function () {
        return driver
            .title()
                .should.eventually.equal('Hello World');
    });

    it('The file index.html should have been actually tampered with', function () {
        return driver
            .waitForElementById('tampering')
                .should.eventually.exist;
    });

    it('The plugin should be able to detect tampering on index.html', function () {
        return driver
            .execute(antiTamperingTest, [])
            .waitFor(wd.asserters.jsCondition('__tamperingTestResult'), 20000, 1000)
                .should.eventually.contain('count');
    });
});
