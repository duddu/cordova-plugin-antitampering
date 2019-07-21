'use strict';

/* eslint no-underscore-dangle: 0 */

var wd = require('wd');
var capabilities = require('./helpers/capabilities');
var drivers = require('./helpers/drivers');

describe('AntiTampering Plugin Test - iOS', function () {
    this.timeout(1000000);
    var driver;
    var allPassed;

    afterEach(function () {
        allPassed = allPassed && this.currentTest.state === 'passed';
    });

    describe('Negative', function () {
        before(function () {
            allPassed = true;
            driver = drivers.getDriver(capabilities.ios.negative);
            return driver;
        });

        after(function () {
            return drivers.quitWithCustomStatus(driver, allPassed);
        });

        it('The Hello World cordova app should load successfully', function () {
            return driver
                .title()
                .should.eventually.equal('Hello World');
        });

        it('The plugin should not detect tampering and return assets count', function () {
            return driver
                .execute(function () {
                    window.__tamperingTestResult = void 0;
                    cordova.plugins.AntiTampering.verify(function (success) {
                        window.__tamperingTestResult = JSON.stringify(success);
                    }, function (error) {
                        window.__tamperingTestResult = JSON.stringify(error);
                    });
                }, [])
                .waitFor(wd.asserters.jsCondition('__tamperingTestResult'), 20000, 1000)
                .should.eventually.contain('{"assets":{"count":');
        });
    });

    describe('Positive', function () {
        before(function () {
            allPassed = true;
            driver = drivers.getDriver(capabilities.ios.positive);
            return driver;
        });

        after(function () {
            return drivers.quitWithCustomStatus(driver, allPassed);
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
                .execute(function () {
                    window.__tamperingTestResult = void 0;
                    cordova.plugins.AntiTampering.verify(function (success) {
                        window.__tamperingTestResult = JSON.stringify(success);
                    }, function (error) {
                        window.__tamperingTestResult = JSON.stringify(error);
                    });
                }, [])
                .waitFor(wd.asserters.jsCondition('__tamperingTestResult'), 20000, 1000)
                .should.eventually.contain('match for file index.html');
        });
    });
});
