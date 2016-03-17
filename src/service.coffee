angular.module('xp-module-session').provider('moduleSession',  ->
    config =
        client_id: ''
        locale: 'ru'
        loginTemplate: null
        registerTemplate: null
    return {
        configure: (params) ->
            angular.extend(config, params)

        $get: [
            'ngDialog'
            (ngDialog) ->
                show: (type, params) ->
                    switch type
                        when 'login'
                            options = {
                                template: if config.loginTemplate then config.loginTemplate else 'templates/signIn.html'
                                controller: 'SignInCtrl'
                                closeByDocument: false
                            }
                        when 'registration'
                            options = {
                                template: if config.loginTemplate then config.loginTemplate else 'templates/signUp.html'
                                controller: 'SignUpCtrl'
                                closeByDocument: false
                            }

                    return ngDialog.open(options)

                close: (dfd, reason) ->
                    dfd.reject(reason) if dfd?
                    ngDialog.closeAll()

                getConfig: () ->
                    return config
        ]
    }
)
