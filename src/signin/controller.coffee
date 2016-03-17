angular.module('xp-module-session').controller('SignInCtrl', ($auth, $scope, moduleSession, $q, xpFormHelper, $rootScope) ->
    @_form = 'signInForm'

    @errors =
        10: 'authData'

    $scope.error_message = errorMessage if errorMessage?
    loginPromise = null

    $scope.locale = moduleSession.getConfig().locale

    $scope.connectProvider = xpFormHelper.connectProvider

    $scope.login = () ->
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
                xpFormHelper.errorHandler res

        return loginPromise.promise


    $scope.close = () ->
        moduleSession.close(loginPromise, 'cancel login')


    $scope.showSignUp = () ->
        $rootScope.$broadcast 'dialog:signup'


    $scope.restorePassword = () ->
        $rootScope.$broadcast 'dialog:restorePassword'
)
