'use strict';

var capabilities = require('./helpers/capabilities');
var drivers = require('./helpers/drivers');

describe('AntiTampering Plugin Test - Android', function () {
    this.timeout(1000000);
    var driver;
    var allPassed;

    afterEach(function () {
        allPassed = allPassed && this.currentTest.state === 'passed';
    });

    describe('Negative', function () {
        before(function () {
            allPassed = true;
            driver = drivers.getDriver(capabilities.android.negative);
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
                .setAsyncScriptTimeout(20000)
                .executeAsync(function (callback) {
                    return cordova.plugins.AntiTampering.verify(function (success) {
                        callback('success -> ' + JSON.stringify(success));
                    }, function (error) {
                        callback('error -> ' + JSON.stringify(error));
                    });
                }, [])
                .should.eventually.contain('{"assets":{"count":');
        });
    });

    describe('Positive', function () {
        before(function () {
            allPassed = true;
            driver = drivers.getDriver(capabilities.android.positive);
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
                .setAsyncScriptTimeout(20000)
                .executeAsync(function (callback) {
                    return cordova.plugins.AntiTampering.verify(function (success) {
                        callback('success -> ' + JSON.stringify(success));
                    }, function (error) {
                        callback('error -> ' + JSON.stringify(error));
                    });
                }, [])
                .should.eventually.contain('index.html has been tampered');
        });
    });
});
