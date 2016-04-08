angular.module('xp-module-session').controller('SignInCtrl', ($auth, $scope, moduleSession, $q, xpFormHelper, $rootScope, customParams) ->
    xpFormHelper.errors =
        10: 'authData'

    $scope.error_message = xpFormHelper.error_message
    loginPromise = null

    $scope.locale = moduleSession.getConfig().locale

    $scope.connectProvider = xpFormHelper.connectProvider
    $scope.submitInProgress = xpFormHelper.submitInProgress
    $scope.socialAuth = moduleSession.getConfig().socialAuth
    $scope.params = customParams
    $scope.remember = true

    $scope.login = () ->
        xpFormHelper._form = $scope.signIn
        if $scope.signIn.$valid and not $scope.submitInProgress
            do xpFormHelper.startSubmiting

            params = {
                username: $scope.email
                password: $scope.password
                remember: $scope.remember
            }

            loginPromise = $q.defer()

            $auth.submitLogin(params).then ((data) ->
                $auth.auth({
                    name: data.username
                    roles: ['user']
                })
                $auth.getUserInfo().then (user) ->
                    moduleSession.close()
                    $rootScope.$broadcast 'login:success'
                    loginPromise.resolve(user)
            ), (res) ->
                xpFormHelper.errorHandler(res).then (error) ->
                    $scope.error_message = error.message

        return loginPromise.promise


    $scope.close = () ->
        moduleSession.close(loginPromise, 'cancel login')


    $scope.showSignUp = () ->
        $rootScope.$broadcast 'dialog:signup'


    $scope.restorePassword = () ->
        $rootScope.$broadcast 'dialog:restorePassword'
)
