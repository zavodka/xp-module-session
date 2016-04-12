angular.module('xp-module-session').controller('SignUpCtrl', ($auth, $scope, $q, moduleSession, xpFormHelper, customParams) ->
    @_form = 'signUpForm'

    xpFormHelper.errors =
        806: 'email'

    $scope.locale = moduleSession.getConfig().locale
    $scope.connectProvider = xpFormHelper.connectProvider
    $scope.socialAuth = moduleSession.getConfig().socialAuth
    $scope.params = customParams
    registerPromise = null

    $scope.register = () ->
        xpFormHelper._form = $scope.signUpForm
        if $scope.signUpForm.$valid and not xpFormHelper.submitInProgress
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

            return registerPromise.promise


    $scope.close = () ->
        $rootScope.$broadcast 'dialog:close'
        moduleSession.close(registerPromise, 'cancel register')

    $scope.showSignIn = () ->
        $rootScope.$broadcast 'dialog:signin'
)
