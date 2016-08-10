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
            xpFormHelper.submitInProgress = false
            $rootScope.$broadcast 'popup:show', {
                type: 'password-restore'
                step: 'send'
            }
            emailSendPromise.resolve()

        $rootScope.$on 'auth:password-reset-request-error', (event, res) ->
            xpFormHelper.errorHandler res.data
            emailSendPromise.reject()
)