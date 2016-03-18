angular.module('xp-module-session').controller('SignUpCtrl', ($auth, $scope, $q, moduleSession, xpFormHelper) ->
    @_form = 'signUpForm'

    @errors =
        806: 'email'

    $scope.locale = moduleSession.getConfig().locale
    $scope.connectProvider = xpFormHelper.connectProvider
    registerPromise = null

    $scope.register = () ->
        if $scope.signUpForm.$valid and not $scope.submitInProgress
            do xpFormHelper.startSubmiting

            password_confirm = $scope.password

            params = {
                email: $scope.email
                password: $scope.password
                password_confirm: password_confirm
                username: $scope.display_name
                locale: 'ru'
            }

            registerPromise = $q.defer()

            $auth.submitRegistration(params, true).then (res) ->
                post_data = {
                    username: params.email
                    password: params.password
                    remember: true
                }
                $auth.submitLogin(post_data).then (res) ->
                    $auth.auth({
                        name: $scope.email
                        roles: ['user']
                    })
                    $auth.getUserInfo().then (user) ->
                        moduleSession.close()
                        registerPromise.resolve(user)
                , (res) ->
                    xpFormHelper.errorHandler res.data

            return registerPromise.promise


    $scope.close = () ->
        moduleSession.close(registerPromise, 'cancel register')

    $scope.showSignUp = () ->
        $rootScope.$broadcast 'dialog:signup'
)
