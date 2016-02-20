var exampleApp = angular.module('exampleApp', ['xp-module-session', 'client-auth']);

exampleApp.controller('sampleController', function($scope, moduleSession){
    $scope.signIn = function () {
        moduleSession.show('login', {});
    };
    $scope.signUp = function () {
        moduleSession.show('registration', {});
    };
})
