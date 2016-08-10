angular.module('xp-module-session').controller('PasswordRestoreCtrl', ($auth, $scope, moduleSession, $q, xpFormHelper, $rootScope, customParams) ->
    @_form = 'email_confirm_form'

    xpFormHelper.errors =
      813: 'nonExistentEmail'

    #$scope.code = @$state.params.code

    xpFormHelper.submitInProgress = false

    $scope.emailSend = () ->
        return unless $scope[@_form].$valid

        xpFormHelper.submitInProgress = true

        deferred = $q.defer()

        reset = $auth.requestPasswordReset({
            client_id: self.configuration.client_id
            email: self.s.form.email
            locale: self.$rootScope.locale
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
            emailSendPromise.reject()

        xpFormHelper.errorHandler res.data


    $scope.passwordRenew = () ->
        renew = $auth.renewPassword({
            code: self.s.code
            client_id: self.configuration.client_id
            password: self.s.form.password
            password_confirm: self.s.form.password_confirm
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