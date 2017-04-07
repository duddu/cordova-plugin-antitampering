var exec = require('cordova/exec');

function AntiTampering () {}

AntiTampering.prototype.verify = function (successCallback, errorCallback) {
    exec(successCallback,
        errorCallback,
        'AntiTamperingPlugin',
        'verify',
        []);
};

module.exports = new AntiTampering();

if (typeof angular !== 'undefined') {
    angular.module('duddu.antitampering', []).factory('$antitampering', ['$q', function ($q) {
        var antitampering = new AntiTampering();
        function getResult (action) {
            var result = $q.defer();
            antitampering[action].apply(antitampering, [
                function (response) {
                    result.resolve(response);
                },
                function (error) {
                    result.reject(error);
                }
            ]);
            return result.promise;
        }
        return Object.keys(AntiTampering.prototype).reduce(function (actions, action) {
            actions[action] = getResult.bind(null, action);
            return actions;
        }, {});
    }]);
}
