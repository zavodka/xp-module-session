angular.module('xp-module-session', ['ngDialog', 'sessionTemplates', 'xp-form-helper', 'pascalprecht.translate', 'valdr']);

angular.module('xp-module-session').factory('matchValidator', function() {
  return {
    name: 'matchValidator',
    validate: function(value, argument) {
      var elem;
      elem = angular.element(document.getElementsByName(argument.match));
      if (elem.length === 0 || elem.val() === "") {
        return true;
      }
      return elem.val() === value;
    }
  };
}).factory('notEqualsValidator', function() {
  return {
    name: 'notEqualsValidator',
    validate: function(value, argument) {
      var elem;
      elem = angular.element(document.getElementsByName(argument.match));
      if (elem.length === 0 || elem.val() === "") {
        return true;
      }
      return elem.val() !== value;
    }
  };
}).factory('emailValidator', function() {
  return {
    name: 'emailValidator',
    validate: function(value, argument) {
      var re;
      re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      return re.test(value);
    }
  };
}).config(function(valdrProvider) {
  valdrProvider.addValidator('matchValidator');
  valdrProvider.addValidator('notEqualsValidator');
  valdrProvider.addValidator('emailValidator');
  return valdrProvider.addConstraints({
    'signin': {
      'email': {
        'required': {
          'message': 'message.required'
        }
      },
      'password': {
        'required': {
          'message': 'message.required'
        }
      }
    },
    'sessions': {
      'email': {
        'emailValidator': {
          'message': 'message.email'
        },
        'required': {
          'message': 'message.required'
        }
      },
      'password': {
        'required': {
          'message': 'message.required'
        },
        'matchValidator': {
          'match': 'password-confirm',
          'message': 'message.match'
        },
        'size': {
          'min': 8,
          'max': 20,
          'message': 'message.size'
        }
      },
      'password-confirm': {
        'required': {
          'message': 'message.required'
        },
        'matchValidator': {
          'match': 'password',
          'message': 'message.match'
        },
        'size': {
          'min': 8,
          'max': 20,
          'message': 'message.size'
        }
      },
      'display-name': {
        'required': {
          'message': 'message.required'
        },
        'size': {
          'max': 20,
          'message': 'message.overlong'
        }
      },
      'code': {
        'required': {
          'message': 'message.required'
        }
      }
    }
  });
});

angular.module('xp-module-session').provider('moduleSession', function() {
  var config;
  config = {
    client_id: '',
    locale: 'ru',
    loginTemplate: null,
    registerTemplate: null,
    socialAuth: true,
    close: true,
    redirect_url: null
  };
  return {
    configure: function(params) {
      return angular.extend(config, params);
    },
    $get: [
      'ngDialog', function(ngDialog) {
        return {
          show: function(type, params) {
            var options;
            switch (type) {
              case 'login':
                options = {
                  template: config.loginTemplate ? config.loginTemplate : 'signin/views/view.html',
                  controller: 'SignInCtrl',
                  closeByEscape: config.close,
                  closeByNavigation: config.close,
                  closeByDocument: config.close,
                  resolve: {
                    customParams: function() {
                      return {
                        custom_title: params.custom_title,
                        autocomplete: params.autocomplete
                      };
                    }
                  }
                };
                break;
              case 'registration':
                options = {
                  template: config.loginTemplate ? config.registerTemplate : 'signup/views/view.html',
                  controller: 'SignUpCtrl',
                  closeByEscape: config.close,
                  closeByNavigation: config.close,
                  closeByDocument: config.close,
                  resolve: {
                    customParams: function() {
                      return {
                        custom_title: params.custom_title,
                        autocomplete: params.autocomplete
                      };
                    }
                  }
                };
                break;
              case 'password-restore':
                options = {
                  template: config.restoreTemplate ? config.restoreTemplate : 'password-restore/views/' + params.step + '.html',
                  controller: 'PasswordRestoreCtrl',
                  closeByEscape: config.close,
                  closeByNavigation: config.close,
                  closeByDocument: config.close,
                  resolve: {
                    customParams: function() {
                      return {
                        custom_title: params.custom_title,
                        autocomplete: params.autocomplete
                      };
                    }
                  }
                };
            }
            return ngDialog.open(options);
          },
          close: function(dfd, reason) {
            if (dfd != null) {
              dfd.reject(reason);
            }
            return ngDialog.closeAll();
          },
          getConfig: function() {
            return config;
          }
        };
      }
    ]
  };
});

angular.module('xp-module-session').controller('PasswordRestoreCtrl', function($auth, $scope, $state, moduleSession, $q, xpFormHelper, $rootScope, customParams) {
  xpFormHelper.errors = {
    813: 'nonExistentEmail'
  };
  xpFormHelper.submitInProgress = false;
  $scope.locale = moduleSession.getConfig().locale;
  $scope.params = customParams;
  return $scope.emailSend = function() {
    var deferred, emailSendPromise, reset;
    if (!$scope.email_confirm_form.$valid) {
      return;
    }
    xpFormHelper.submitInProgress = true;
    deferred = $q.defer();
    reset = $auth.requestPasswordReset({
      client_id: '5B1EB814FEC8C',
      email: $scope.form.email,
      locale: $scope.locale
    });
    emailSendPromise = $q.defer();
    $rootScope.$on('auth:password-reset-request-success', function(event) {
      xpFormHelper.submitInProgress = false;
      $rootScope.$broadcast('dialog:restorePassword', {
        type: 'password-restore',
        step: 'send'
      });
      return emailSendPromise.resolve();
    });
    return $rootScope.$on('auth:password-reset-request-error', function(event, res) {
      xpFormHelper.errorHandler(res.data);
      return emailSendPromise.reject();
    });
  };
});

angular.module('xp-module-session').controller('SignUpCtrl', function($auth, $scope, $q, moduleSession, xpFormHelper, customParams, $rootScope) {
  var registerPromise;
  this._form = 'signUpForm';
  xpFormHelper.errors = {
    806: 'email'
  };
  $scope.locale = moduleSession.getConfig().locale;
  $scope.connectProvider = xpFormHelper.connectProvider;
  $scope.socialAuth = moduleSession.getConfig().socialAuth;
  $scope.params = customParams;
  registerPromise = null;
  $scope.clearError = function(code) {
    $scope.error_message = '';
    return xpFormHelper.clearError(code);
  };
  $scope.register = function() {
    var params, password_confirm;
    xpFormHelper._form = $scope.signUpForm;
    if ($scope.signUpForm.$valid && !xpFormHelper.submitInProgress) {
      xpFormHelper.startSubmiting();
      password_confirm = $scope.password;
      params = {
        email: $scope.email,
        password: $scope.password,
        password_confirm: password_confirm,
        username: $scope.display_name,
        locale: 'ru'
      };
      registerPromise = $q.defer();
      $auth.submitRegistration(params, true).then(function(res) {
        var post_data;
        post_data = {
          username: params.email,
          password: params.password,
          remember: true
        };
        return $auth.submitLogin(post_data).then((function(data) {
          $auth.auth({
            name: data.username,
            roles: ['user']
          });
          return $auth.getUserInfo().then(function(user) {
            moduleSession.close();
            $rootScope.$broadcast('login:success');
            return registerPromise.resolve(user);
          });
        }), function(res) {
          return xpFormHelper.errorHandler(res).then(function(error) {
            return $scope.error_message = error.message;
          });
        });
      }, function(res) {
        return xpFormHelper.errorHandler(res).then(function(error) {
          return $scope.error_message = error.message;
        });
      });
      return registerPromise.promise;
    }
  };
  $scope.close = function() {
    $rootScope.$broadcast('dialog:close');
    return moduleSession.close(registerPromise, 'cancel register');
  };
  return $scope.showSignIn = function() {
    return $rootScope.$broadcast('dialog:signin');
  };
});

angular.module('xp-module-session').controller('SignInCtrl', function($auth, $scope, moduleSession, $q, xpFormHelper, $rootScope, customParams) {
  var loginPromise;
  xpFormHelper.errors = {
    10: 'authData'
  };
  loginPromise = null;
  $scope.locale = moduleSession.getConfig().locale;
  $scope.connectProvider = xpFormHelper.connectProvider;
  $scope.socialAuth = moduleSession.getConfig().socialAuth;
  $scope.params = customParams;
  $scope.clearError = function(code) {
    $scope.error_message = '';
    return xpFormHelper.clearError(code);
  };
  $scope.remember = true;
  $scope.login = function() {
    var params;
    xpFormHelper._form = $scope.signIn;
    if ($scope.signIn.$valid && !xpFormHelper.submitInProgress) {
      xpFormHelper.startSubmiting();
      params = {
        username: $scope.email,
        password: $scope.password,
        remember: $scope.remember
      };
      loginPromise = $q.defer();
      $auth.submitLogin(params).then((function(data) {
        $auth.auth({
          name: data.username,
          roles: ['user']
        });
        return $auth.getUserInfo().then(function(user) {
          moduleSession.close();
          $rootScope.$broadcast('login:success');
          return loginPromise.resolve(user);
        });
      }), function(res) {
        return xpFormHelper.errorHandler(res).then(function(error) {
          return $scope.error_message = error.message;
        });
      });
    }
    return loginPromise.promise;
  };
  $scope.close = function() {
    $rootScope.$broadcast('dialog:close');
    return moduleSession.close(loginPromise, 'cancel login');
  };
  $scope.showSignUp = function() {
    return $rootScope.$broadcast('dialog:signup');
  };
  return $scope.restorePassword = function() {
    return $rootScope.$broadcast('dialog:restorePassword');
  };
});

angular.module("sessionTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("password-restore/views/email.html","<div class=\"module-sessions-password-restore ui-modal\">\n    <div class=\"modal-title\">\n        <h1>{{ \'MODAL.password_restore_title\' | translate }}</h1>\n    </div>\n    <form name=\"email_confirm_form\" novalidate=\"novalidate\" valdr-type=\"sessions\">\n        <p class=\"modal-text\">{{ \'MODAL.password_restore_email\' | translate }}</p>\n        <div class=\"modal-footer\">\n            <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\n                <input type=\"email\" name=\"email\" ng-model=\"form.email\" ng-keyup=\"clearError(813)\"/>\n            </div>\n            <div ng-show=\"error_message\" class=\"form-errors\">{{ error_message }}</div>\n            <button ng-click=\"emailSend()\" cg-busy=\"{promise:emailSendPromise,wrapperClass:\'transparent\',templateUrl:\'ui/loader/loader.html\'}\" class=\"btn btn__success\"><span ng-bind=\"\'COMMON.button_continue\' | translate\" ng-hide=\"submitInProgress\"> </span></button>\n        </div>\n    </form>\n</div>");
$templateCache.put("password-restore/views/send.html","<div class=\"ui-modal\">\n    <div class=\"modal-title\">\n        <h1>{{ \'MODAL.password_restore_title\' | translate }}</h1>\n    </div>\n    <form>\n        <p class=\"modal-text\">{{ \'MODAL.password_restore_send\' | translate }}</p>\n    </form>\n</div>");
$templateCache.put("signup/views/view.html","<div cg-busy=\"{promise:providerPromise.promise,templateUrl:\'ui/loader/fill-loader.html\'}\" class=\"module-sessions-signup ui-modal\">\n    <div class=\"modal-title\">\n        <h1 ng-show=\"params.custom_title\">{{ params.custom_title }}</h1>\n        <h1 ng-hide=\"params.custom_title\">{{ \'MODAL.signup_title\' | translate }}</h1>\n    </div>\n    <form name=\"signUpForm\" novalidate=\"novalidate\" valdr-type=\"sessions\">\n        <p ng-if=\"socialAuth\">{{ \'MODAL.session_social\' | translate }}</p>\n        <div ng-if=\"socialAuth\" ng-class=\" {disabled: submitInProgress} \" class=\"social\">\n            <div ng-click=\"connectProvider(\'facebook\')\" class=\"social-button social-button__fb\"></div>\n            <div ng-click=\"connectProvider(\'naszaklasa\')\" ng-if=\"locale == \'pl\'\" class=\"social-button social-button__nk\"></div>\n            <div ng-click=\"connectProvider(\'vkontakte\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__vk\"></div>\n            <div ng-click=\"connectProvider(\'odnoklassniki\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__ok\"></div>\n            <div ng-click=\"connectProvider(\'mailru\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__mm\"></div>\n            <div ng-click=\"connectProvider(\'google\')\" ng-if=\"locale == \'en\' || locale == \'pl\'\" class=\"social-button social-button__gp\"></div>\n            <div ng-click=\"connectProvider(\'twitter\')\" ng-if=\"locale == \'en\'\" class=\"social-button social-button__tw\"></div>\n            <div ng-click=\"connectProvider(\'yahoo\')\" ng-if=\"locale == \'en\'\" class=\"social-button social-button__ya\"></div>\n        </div>\n        <div ng-if=\"socialAuth\" class=\"separator\">\n            <p>{{ \'MODAL.or\' | translate }}</p>\n        </div>\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\n            <label>{{ \'MODAL.session_email\' | translate }}</label>\n            <input type=\"email\" name=\"email\" ng-model=\"email\" ng-keyup=\"clearError(806)\" ng-disabled=\"submitInProgress\"/>\n        </div>\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\n            <label>{{ \'MODAL.session_password\' | translate }}</label>\n            <input type=\"password\" name=\"password\" ng-model=\"password\" ng-disabled=\"submitInProgress\"/>\n        </div>\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\n            <label>{{ \'MODAL.session_nick\' | translate }}</label>\n            <input type=\"text\" name=\"display-name\" ng-model=\"display_name\" maxlength=\"20\" ng-disabled=\"submitInProgress\"/>\n        </div>\n        <div class=\"form-button\">\n            <p class=\"mute\">\n                Регистрируясь, вы соглашаетесь с правилами, установленными <a href=\"https://101xp.com/pages/eula\" target=\"_blank\">пользовательским соглашением</a> и <a href=\"https://101xp.com/pages/policy\" target=\"_blank\">политикой приватности</a>.\n            </p>\n            <button ng-click=\"register()\" cg-busy=\"{promise:registerPromise,wrapperClass:\'transparent\', templateUrl: \'ui/loader/loader.html\'}\" class=\"btn btn__success\"><span ng-hide=\"submitInProgress\">{{ \'COMMON.button_join\' | translate }}</span></button>\n        </div>\n        <div ng-if=\"!submitInProgress\" ng-show=\"error_message\" class=\"form-errors\">{{ error_message }}</div>\n        <div class=\"modal-footer\">{{ \'MODAL.session_have_account\' | translate }}&nbsp;<a ng-click=\"showSignIn()\">{{ \'COMMON.button_signin\' | translate }}</a></div>\n    </form>\n</div>\n");
$templateCache.put("signin/views/view.html","<div cg-busy=\"providerPromise.promise\" class=\"module-sessions-signup ui-modal\">\n    <div class=\"modal-title\">\n        <h1 ng-show=\"params.custom_title\">{{ params.custom_title }}</h1>\n        <h1 ng-hide=\"params.custom_title\">{{ \'MODAL.signin_title\' | translate }}</h1>\n    </div>\n    <form name=\"signIn\" novalidate=\"novalidate\" formfocus=\"formfocus\" valdr-type=\"signin\" autocomplete=\"{{ params.autocomplete }}\">\n        <p ng-if=\"socialAuth\">{{ \'MODAL.session_social\' | translate }}</p>\n        <div ng-if=\"socialAuth\" ng-class=\" {disabled: submitInProgress} \" class=\"social\">\n            <div ng-click=\"connectProvider(\'facebook\')\" class=\"social-button social-button__fb\"></div>\n            <div ng-click=\"connectProvider(\'naszaklasa\')\" ng-if=\"locale == \'pl\'\" class=\"social-button social-button__nk\"></div>\n            <div ng-click=\"connectProvider(\'vkontakte\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__vk\"></div>\n            <div ng-click=\"connectProvider(\'odnoklassniki\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__ok\"></div>\n            <div ng-click=\"connectProvider(\'mailru\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__mm\"></div>\n            <div ng-click=\"connectProvider(\'google\')\" ng-if=\"locale == \'en\' || locale == \'pl\'\" class=\"social-button social-button__gp\"></div>\n            <div ng-click=\"connectProvider(\'twitter\')\" ng-if=\"locale == \'en\'\" class=\"social-button social-button__tw\"></div>\n            <div ng-click=\"connectProvider(\'yahoo\')\" ng-if=\"locale == \'en\'\" class=\"social-button social-button__ya\"></div>\n        </div>\n        <div class=\"separator\" ng-if=\"socialAuth\">\n            <p>{{ \'MODAL.or\' | translate }}</p>\n        </div>\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\n            <label>{{ \'MODAL.session_email\' | translate }}</label>\n            <input type=\"email\" name=\"email\" ng-model=\"email\" ng-disabled=\"submitInProgress\" ng-keyup=\"clearError(10)\"/>\n        </div>\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\n            <label>{{ \'MODAL.session_password\' | translate }}</label>\n            <input type=\"password\" name=\"password\" ng-model=\"password\" ng-disabled=\"submitInProgress\" ng-keyup=\"clearError(10)\"/>\n        </div>\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\n            <input type=\"checkbox\" name=\"remember\" ng-model=\"remember\" ng-disabled=\"submitInProgress\"/>{{ \'MODAL.session_remember\' | translate }}\n        </div>\n        <div class=\"form-button\">\n            <button ng-click=\"login()\" cg-busy=\"{promise:loginPromise,wrapperClass:\'transparent\', templateUrl: \'ui/loader/loader.html\'}\" class=\"btn btn__success\"><span ng-hide=\"submitInProgress\">{{ \'COMMON.button_signin\' | translate }}</span></button>\n        </div>\n        <div ng-if=\"!submitInProgress\" ng-show=\"error_message\" class=\"form-errors\">{{ error_message }}</div>\n        <div class=\"modal-footer\">\n            {{ \'MODAL.session_no_account\' | translate }}&nbsp;<a ng-click=\"showSignUp()\">{{ \'COMMON.button_signup\' | translate }}</a><br />\n            {{ \'MODAL.forgot_password_text\' | translate }}&nbsp;<a ng-click=\"restorePassword()\">{{ \'MODAL.forgot_password_link\' | translate }}</a>\n        </div>\n    </form>\n</div>\n");}]);