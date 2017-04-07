/**
 * Get the value of a plugin's preference. If a value is explicitly set in project
 * config.xml variables, it overtakes the value set when first installing the plugin.
 * @param {Object} context - Cordova context.
 * @param {string} preference - Key of preference to retrieve.
 */
exports.getPluginPreference = invokeHelper.bind(null, './get_plugin_preference');

/**
 * Get the real list of platforms affected by a running plugin hook.
 */
exports.getPlatformsList = invokeHelper.bind(null, './get_platforms_list');

/**
 * Detect if the context process is running with verbose option.
 */
exports.isVerbose = invokeHelper.bind(null, './is_verbose');


function invokeHelper (path) {
    var helper = require(path);
    var context = arguments[1];
    return helper.apply(context, Array.prototype.splice.call(arguments, 2));
}
