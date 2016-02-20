angular.module('xp-module-session').controller('SignInCtrl', ($auth, $scope, moduleSession, $q) ->
    @_form = 'signInForm'

    @errors =
        10: 'authData'

    $scope.error_message = errorMessage if errorMessage?
    loginPromise = null

    $scope.locale = moduleSession.getConfig().locale

    $scope.login = () ->
        if @$scope.signIn.$valid and not $scope.submitInProgress
            do @startSubmiting

            params = {
                username: $scope.email
                password: $scope.password
                client_id: ''
                remember: $scope.remember
            }

            loginPromise = $q.defer()

            $auth.submitLogin(params).then ((data) ->
                $auth.principal.authenticate({
                    name: data.username
                    roles: ['user']
                })
                user = $auth.getUserInfo()
                moduleSession.close()
                loginPromise.resolve(user)
            ), (res) ->
                errorHandler res

        return loginPromise.promise


    $scope.close = () ->
        moduleSession.close(loginPromise, 'cancel login')
)
