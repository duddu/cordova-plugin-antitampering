'use strict';

var wd = require('wd');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var logging = require('./logging');
var servers = require('./servers');

chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

exports.getDriver = function (capabilities) {
    var driver = wd.promiseChainRemote(servers.sauce);
    logging.configure(driver);

    return driver
        .init(capabilities)
        .setImplicitWaitTimeout(5000);
};

exports.quitWithCustomStatus = function (driver, status) {
    return driver
        .quit()
        .finally(function () {
            return driver.sauceJobStatus(status);
        });
};
