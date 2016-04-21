angular.module('xp-module-session', ['ngDialog', 'sessionTemplates', 'xp-form-helper', 'pascalprecht.translate'])

angular.module('xp-module-session').config (valdrProvider) ->
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
