angular.module('xp-module-session').controller('SignUpCtrl', ($auth, $scope, $q, moduleSession) ->
    @_form = 'signUpForm'

    @errors =
        806: 'email'

    $scope.locale = moduleSession.getConfig().locale
    registerPromise = null

    $scope.register = () ->
        if $scope.signUpForm.$valid and not $scope.submitInProgress
            do startSubmiting

            password_confirm = $scope.password

            params = {
                email: $scope.email
                password: $scope.password
                password_confirm: password_confirm
                username: $scope.display_name
                lcoale: ''
            }

            registerPromise = $q.defer()

            $auth.submitregistration(params, true).registerPromise.then (res) ->
                $auth.submitLogin(params).then (res) ->
                    $auth.principal.authenticate({
                        name: $scope.email
                        roles: ['user']
                    })
                    user = $auth.getUserInfo()
                    moduleSession.close()
                    registerPromise.resovle(user)
                , (res) ->
                    errorHandler res.data

            return registerPromise.promise


    $scope.close = () ->
        moduleSession.close(registerPromise, 'cancel register')
)
