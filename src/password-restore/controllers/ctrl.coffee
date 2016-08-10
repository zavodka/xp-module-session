angular.module('xp-module-session').controller('PasswordRestoreCtrl', ($auth, $scope, moduleSession, $q, xpFormHelper, $rootScope, customParams) ->
    xpFormHelper.errors =
      813: 'nonExistentEmail'

    #$scope.code = @$state.params.code

    xpFormHelper.submitInProgress = false

    $scope.locale = moduleSession.getConfig().locale
    $scope.params = customParams

    $scope.emailSend = () ->
        return unless $scope.email_confirm_form.$valid

        xpFormHelper.submitInProgress = true

        deferred = $q.defer()

        reset = $auth.requestPasswordReset({
            client_id: '5B1EB814FEC8C' # $scope.params.client_id
            email: $scope.form.email
            locale: $scope.locale
        })

        emailSendPromise = $q.defer()

        $rootScope.$on 'auth:password-reset-request-success', (event) ->
            emailSendPromise.resolve()
            xpFormHelper.submitInProgress = false
            $rootScope.$broadcast 'popup:show', {
                type: 'password-restore'
                step: 'send'
            }

        $rootScope.$on 'auth:password-reset-request-error', (event, res) ->
            xpFormHelper.errorHandler res.data
            emailSendPromise.reject()


    $scope.passwordRenew = () ->
        renew = $auth.renewPassword({
            code: $scope.code
            client_id: '5B1EB814FEC8C' # self.configuration.client_id
            password: $scope.form.password
            password_confirm: $scope.form.password_confirm
        })

        $rootScope.$on 'auth:password-renew-success', (event, res) ->
              $auth.handleValidAuth(res, true)
              principal.authenticate({
                #TODO Крашится, когда тут передается username, т.к. он из ответа и не приходит. По сути вообще name не нужен
                #name: data.username,
                roles: ['user']
            })

            $auth.getUserInfo()

            $rootScope.$on 'auth:password-renew-error', (event, res) ->
                $scope.error_message = error.message
)