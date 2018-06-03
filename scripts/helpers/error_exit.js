module.exports = function (msg, exception) {
    process.stdout.write('\n[ANTI-TAMPERING] ERROR! ' + msg + '\n');
    throw new Error(exception);
};
