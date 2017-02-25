'use strict';

exports.getWebView = function (driver) {
    return driver.contexts().then(function (contexts) {
        return driver.context(contexts[1]);
    });
};
