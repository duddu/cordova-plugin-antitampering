'use strict';

/* eslint no-process-env: 0 */

exports.sauce = {
    protocol: 'https',
    host: 'ondemand.saucelabs.com',
    port: 443,
    auth: process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY
};
