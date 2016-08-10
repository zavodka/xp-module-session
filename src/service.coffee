angular.module('xp-module-session').provider('moduleSession',  ->
    config =
        client_id: ''
        locale: 'ru'
        loginTemplate: null
        registerTemplate: null
        socialAuth: true
        close: true
        redirect_url: null
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
                                template: if config.loginTemplate then config.loginTemplate else 'signin/views/view.html'
                                controller: 'SignInCtrl'
                                closeByEscape: config.close
                                closeByNavigation: config.close
                                closeByDocument: config.close
                                resolve:
                                    customParams: ->
                                        return {
                                            custom_title: params.custom_title
                                            autocomplete: params.autocomplete
                                        }
                            }
                        when 'registration'
                            options = {
                                template: if config.loginTemplate then config.registerTemplate else 'signup/views/view.html'
                                controller: 'SignUpCtrl'
                                closeByEscape: config.close
                                closeByNavigation: config.close
                                closeByDocument: config.close
                                resolve:
                                    customParams: ->
                                        return {
                                            custom_title: params.custom_title
                                            autocomplete: params.autocomplete
                                        }
                            }
                        when 'password-restore'
                            console.log 'password-restore'
                            console.dir params
                            options = {
                                template: if config.restoreTemplate then config.restoreTemplate else 'password-restore/views/' + params.step + '.html'
                                controller: 'PasswordRestoreCtrl'
                                closeByEscape: config.close
                                closeByNavigation: config.close
                                closeByDocument: config.close
                                resolve:
                                    customParams: ->
                                        return {
                                            custom_title: params.custom_title
                                            autocomplete: params.autocomplete
                                        }
                        }

                    console.log 'options'
                    console.dir options
                    return ngDialog.open(options)

                close: (dfd, reason) ->
                    dfd.reject(reason) if dfd?
                    ngDialog.closeAll()

                getConfig: () ->
                    return config
        ]
    }
)
