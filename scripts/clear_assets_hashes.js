#!/usr/bin/env node

var helpers = require('./helpers');

module.exports = function (context) {
    var fs = require('fs');

    process.stdout.write('[ANTI-TAMPERING] Clearing assets hash from previous build\n');

    helpers.getPlatformsList(context).forEach(function (platform) {
        var source = helpers.getPluginSource(context, platform);
        var content = source.content;

        if (platform === 'android') {
            content = source.content.replace(/\s*put\("[^"]+",\s"[^"]{64}"\);/g, '')
                .replace(/assetsHashes\s*=.+\s*new.*(\(\d+\)[^\w]*)\);/, function (match, group) {
                    return match.replace(group, '()\n    ');
                });

            try {
                fs.writeFileSync(source.path, content, 'utf-8');
            } catch (e) {
                helpers.exit('Unable to write java class source at path ' + source.path, e);
            }
        }

        if (platform === 'ios') {
            content = source.content.replace(/assetsHashes = (@{([^}]*)});/, function (a, b) {
                var empty = '@{}';
                return a.replace(b, empty);
            });

            try {
                fs.writeFileSync(source.path, content, 'utf-8');
            } catch (e) {
                helpers.exit('Unable to write obj-c source at path ' + source.path, e);
            }
        }
    });
};
