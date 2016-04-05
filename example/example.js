var exampleApp = angular.module('exampleApp', ['xp-module-session', 'xp-client-auth', 'ngCookies']);

exampleApp.config(function($translateProvider) {
    return $translateProvider.translations('ru', {}).preferredLanguage('ru');
});

exampleApp.config(function($authProvider) {
    $authProvider.configure({
        client_id: '5B1EB814FEC8C',
        apiUrl: {
            'api': 'https://api.101xp.com',
            'auth': 'https://auth.101xp.com'
        }
    });
});
exampleApp.config(function(moduleSessionProvider) {
    moduleSessionProvider.configure({
        socialAuth: false
    })
});

exampleApp.controller('sampleController', function($scope, moduleSession){
    $scope.signIn = function () {
        moduleSession.show('login', {custom_title: 'Auth', autocomplete: 'off'});
    };
    $scope.signUp = function () {
        moduleSession.show('registration', {});
    };
})
