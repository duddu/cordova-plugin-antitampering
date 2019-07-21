'use strict';

exports.getWebView = function (driver) {
    return driver.contexts().then(function (contexts) {
        if (!contexts[1]) {
            throw new Error('No WebView context available! Try re-run the job...');
        }
        return driver.context(contexts[1]);
    });
};
