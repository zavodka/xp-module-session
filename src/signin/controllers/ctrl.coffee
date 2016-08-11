angular.module('xp-module-session').controller('SignInCtrl', ($auth, $scope, moduleSession, $q, xpFormHelper, $rootScope, customParams) ->
    xpFormHelper.errors =
        10: 'authData'

    loginPromise = null

    $scope.locale = moduleSession.getConfig().locale

    $scope.connectProvider = xpFormHelper.connectProvider
    $scope.socialAuth = moduleSession.getConfig().socialAuth
    $scope.params = customParams

    $scope.clearError = (code) ->
        $scope.error_message = ''
        xpFormHelper.clearError code
    $scope.remember = true

    $scope.login = () ->
        xpFormHelper._form = $scope.signIn

        if $scope.signIn.$valid and not xpFormHelper.submitInProgress
            do xpFormHelper.startSubmiting

            params = {
                username: $scope.email
                password: $scope.password
                remember: $scope.remember
            }

            $scope.loginPromise = $auth.submitLogin(params)

            $scope.loginPromise.then ((data) ->
                $auth.auth({
                    name: data.username
                    roles: ['user']
                })
                $auth.getUserInfo().then (user) ->
                    moduleSession.close()
                    $rootScope.$broadcast 'login:success'
                do xpFormHelper.finishSubmiting

            ), (res) ->
                xpFormHelper.errorHandler(res).then (error) ->
                    $scope.error_message = error.message
                    do xpFormHelper.finishSubmiting


    $scope.close = () ->
        $rootScope.$broadcast 'dialog:close'
        moduleSession.close()


    $scope.showSignUp = () ->
        $rootScope.$broadcast 'dialog:signup'


    $scope.restorePassword = () ->
        $rootScope.$broadcast 'dialog:restorePassword'
)
