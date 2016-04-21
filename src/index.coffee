angular.module('xp-module-session', ['ngDialog', 'sessionTemplates', 'xp-form-helper', 'pascalprecht.translate', 'valdr'])

angular.module('xp-module-session').factory 'matchValidator', ->
    {
    name: 'matchValidator'
    validate: (value, argument) ->
        elem = angular.element(document.getElementsByName(argument.match))
        if elem.length == 0 or elem.val() == ""
            return true

        elem.val() == value
    }
.factory 'notEqualsValidator', ->
    {
    name: 'notEqualsValidator'
    validate: (value, argument) ->
        elem = angular.element(document.getElementsByName(argument.match))
        if elem.length == 0 or elem.val() == ""
            return true

        elem.val() != value
    }
.factory 'emailValidator', ->
    {
    name: 'emailValidator'
    validate: (value, argument) ->
        re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
        return re.test(value)
    }.config (valdrProvider) ->
    valdrProvider.addValidator('matchValidator')
    valdrProvider.addValidator('notEqualsValidator')
    valdrProvider.addValidator('emailValidator')
    valdrProvider
    .addConstraints
        'signin':
            'email':
                'required':
                    'message': 'message.required'
            'password':
                'required':
                    'message': 'message.required'
        'sessions':
            'email':
                'emailValidator':
                    'message': 'message.email'
                'required':
                    'message': 'message.required'
            'password':
                'required':
                    'message': 'message.required'
                'matchValidator':
                    'match': 'password-confirm'
                    'message': 'message.match'
                'size':
                    'min': 8
                    'max': 20
                    'message': 'message.size'
            'password-confirm':
                'required':
                    'message': 'message.required'
                'matchValidator':
                    'match': 'password'
                    'message': 'message.match'
                'size':
                    'min': 8
                    'max': 20
                    'message': 'message.size'
            'display-name': {
                'required':
                    'message': 'message.required'
                'size':
                    'max': 20
                    'message': 'message.overlong'
            }
            'code':
                'required':
                    'message': 'message.required'
