'use strict';

/* eslint no-console: 0, no-process-env: 0, no-underscore-dangle: 0 */

var wd = require('wd');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var logging = require('./helpers/logging');
var servers = require('./helpers/servers');
var capabilities = require('./helpers/capabilities');
var contexts = require('./helpers/contexts');

chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

describe('AntiTampering Plugin Test - iOS', function () {
    this.timeout(1000000);
    var driver;
    var allPassed = true;

    before(function () {
        driver = wd.promiseChainRemote(servers.sauce);
        logging.configure(driver);

        return driver
            .init(capabilities.ios)
            .setImplicitWaitTimeout(5000)
            .then(function () {
                return contexts.getWebView(driver);
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
