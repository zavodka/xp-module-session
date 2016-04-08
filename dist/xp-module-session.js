angular.module('xp-module-session', ['ngDialog', 'sessionTemplates', 'xp-form-helper', 'pascalprecht.translate']);

angular.module('xp-module-session').provider('moduleSession', function() {
  var config;
  config = {
    client_id: '',
    locale: 'ru',
    loginTemplate: null,
    registerTemplate: null,
    socialAuth: true,
    close: true
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
                  template: config.loginTemplate ? config.loginTemplate : 'templates/signIn.html',
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
                  template: config.loginTemplate ? config.loginTemplate : 'templates/signUp.html',
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
    return moduleSession.close(loginPromise, 'cancel login');
  };
  $scope.showSignUp = function() {
    return $rootScope.$broadcast('dialog:signup');
  };
  return $scope.restorePassword = function() {
    return $rootScope.$broadcast('dialog:restorePassword');
  };
});

angular.module('xp-module-session').controller('SignUpCtrl', function($auth, $scope, $q, moduleSession, xpFormHelper, customParams) {
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
        return $auth.submitLogin(params).then((function(data) {
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
      });
      return registerPromise.promise;
    }
  };
  $scope.close = function() {
    return moduleSession.close(registerPromise, 'cancel register');
  };
  return $scope.showSignUp = function() {
    return $rootScope.$broadcast('dialog:signup');
  };
});

angular.module("sessionTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("templates/signIn.html","<div cg-busy=\"providerPromise.promise\" class=\"module-sessions-signup ui-modal\">\r\n    <div class=\"modal-title\">\r\n        <h1 ng-show=\"params.custom_title\">{{ params.custom_title }}</h1>\r\n        <h1 ng-hide=\"params.custom_title\">{{ \'MODAL.signin_title\' | translate }}</h1>\r\n    </div>\r\n    <form name=\"signIn\" novalidate=\"novalidate\" formfocus=\"formfocus\" valdr-type=\"signin\" autocomplete=\"{{ params.autocomplete }}\">\r\n        <p ng-if=\"socialAuth\">{{ \'MODAL.session_social\' | translate }}</p>\r\n        <div ng-if=\"socialAuth\" ng-class=\" {disabled: submitInProgress} \" class=\"social\">\r\n            <div ng-click=\"connectProvider(\'facebook\')\" class=\"social-button social-button__fb\"></div>\r\n            <div ng-click=\"connectProvider(\'naszaklasa\')\" ng-if=\"locale == \'pl\'\" class=\"social-button social-button__nk\"></div>\r\n            <div ng-click=\"connectProvider(\'vkontakte\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__vk\"></div>\r\n            <div ng-click=\"connectProvider(\'odnoklassniki\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__ok\"></div>\r\n            <div ng-click=\"connectProvider(\'mailru\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__mm\"></div>\r\n            <div ng-click=\"connectProvider(\'google\')\" ng-if=\"locale == \'en\' || locale == \'pl\'\" class=\"social-button social-button__gp\"></div>\r\n            <div ng-click=\"connectProvider(\'twitter\')\" ng-if=\"locale == \'en\'\" class=\"social-button social-button__tw\"></div>\r\n            <div ng-click=\"connectProvider(\'yahoo\')\" ng-if=\"locale == \'en\'\" class=\"social-button social-button__ya\"></div>\r\n        </div>\r\n        <div class=\"separator\" ng-if=\"socialAuth\">\r\n            <p>{{ \'MODAL.or\' | translate }}</p>\r\n        </div>\r\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\r\n            <label>{{ \'MODAL.session_email\' | translate }}</label>\r\n            <input type=\"email\" name=\"email\" ng-model=\"email\" ng-disabled=\"submitInProgress\" ng-keyup=\"clearError(10)\"/>\r\n        </div>\r\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\r\n            <label>{{ \'MODAL.session_password\' | translate }}</label>\r\n            <input type=\"password\" name=\"password\" ng-model=\"password\" ng-disabled=\"submitInProgress\" ng-keyup=\"clearError(10)\"/>\r\n        </div>\r\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\r\n            <input type=\"checkbox\" name=\"remember\" ng-model=\"remember\" ng-disabled=\"submitInProgress\"/>{{ \'MODAL.session_remember\' | translate }}\r\n        </div>\r\n        <div class=\"form-button\">\r\n            <button ng-click=\"login()\" cg-busy=\"{promise:loginPromise,wrapperClass:\'transparent\', templateUrl: \'ui/loader/loader.html\'}\" class=\"btn btn__success\"><span ng-hide=\"submitInProgress\">{{ \'COMMON.button_signin\' | translate }}</span></button>\r\n        </div>\r\n        <div ng-if=\"!submitInProgress\" ng-show=\"error_message\" class=\"form-errors\">{{ error_message }}</div>\r\n        <div class=\"modal-footer\">{{ \'MODAL.session_no_account\' | translate }}&nbsp;<a ng-click=\"showSignUp()\">{{ \'COMMON.button_signup\' | translate }}</a></div>\r\n    </form>\r\n</div>\r\n");
$templateCache.put("templates/signUp.html","<div cg-busy=\"{promise:providerPromise.promise,templateUrl:\'ui/loader/fill-loader.html\'}\" class=\"module-sessions-signup ui-modal\">\r\n    <div class=\"modal-title\">\r\n        <h1 ng-show=\"params.custom_title\">{{ params.custom_title }}</h1>\r\n        <h1 ng-hide=\"params.custom_title\">{{ \'MODAL.signup_title\' | translate }}</h1>\r\n    </div>\r\n    <form name=\"signUpForm\" novalidate=\"novalidate\" valdr-type=\"sessions\">\r\n        <p ng-if=\"socialAuth\">{{ \'MODAL.session_social\' | translate }}</p>\r\n        <div ng-if=\"socialAuth\" ng-class=\" {disabled: submitInProgress} \" class=\"social\">\r\n            <div ng-click=\"connectProvider(\'facebook\')\" class=\"social-button social-button__fb\"></div>\r\n            <div ng-click=\"connectProvider(\'naszaklasa\')\" ng-if=\"locale == \'pl\'\" class=\"social-button social-button__nk\"></div>\r\n            <div ng-click=\"connectProvider(\'vkontakte\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__vk\"></div>\r\n            <div ng-click=\"connectProvider(\'odnoklassniki\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__ok\"></div>\r\n            <div ng-click=\"connectProvider(\'mailru\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__mm\"></div>\r\n            <div ng-click=\"connectProvider(\'google\')\" ng-if=\"locale == \'en\' || locale == \'pl\'\" class=\"social-button social-button__gp\"></div>\r\n            <div ng-click=\"connectProvider(\'twitter\')\" ng-if=\"locale == \'en\'\" class=\"social-button social-button__tw\"></div>\r\n            <div ng-click=\"connectProvider(\'yahoo\')\" ng-if=\"locale == \'en\'\" class=\"social-button social-button__ya\"></div>\r\n        </div>\r\n        <div ng-if=\"socialAuth\" class=\"separator\">\r\n            <p>{{ \'MODAL.or\' | translate }}</p>\r\n        </div>\r\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\r\n            <label>{{ \'MODAL.session_email\' | translate }}</label>\r\n            <input type=\"email\" name=\"email\" ng-model=\"email\" ng-keyup=\"clearError(806)\" ng-disabled=\"submitInProgress\"/>\r\n        </div>\r\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\r\n            <label>{{ \'MODAL.session_password\' | translate }}</label>\r\n            <input type=\"password\" name=\"password\" ng-model=\"password\" ng-disabled=\"submitInProgress\"/>\r\n        </div>\r\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\r\n            <label>{{ \'MODAL.session_nick\' | translate }}</label>\r\n            <input type=\"text\" name=\"display-name\" ng-model=\"display_name\" maxlength=\"20\" ng-disabled=\"submitInProgress\"/>\r\n        </div>\r\n        <div class=\"form-button\">\r\n            <p class=\"mute\">\r\n                Регистрируясь, вы соглашаетесь с правилами, установленными <a href=\"https://101xp.com/pages/eula\" target=\"_blank\">пользовательским соглашением</a> и <a href=\"https://101xp.com/pages/policy\" target=\"_blank\">политикой приватности</a>.\r\n            </p>\r\n            <button ng-click=\"register()\" cg-busy=\"{promise:registerPromise,wrapperClass:\'transparent\', templateUrl: \'ui/loader/loader.html\'}\" class=\"btn btn__success\"><span ng-hide=\"submitInProgress\">{{ \'COMMON.button_join\' | translate }}</span></button>\r\n        </div>\r\n        <div ng-if=\"!submitInProgress\" ng-show=\"error_message\" class=\"form-errors\">{{ error_message }}</div>\r\n        <div class=\"modal-footer\">{{ \'MODAL.session_have_account\' | translate }}&nbsp;<a ng-click=\"showSignIn()\">{{ \'COMMON.button_signin\' | translate }}</a></div>\r\n    </form>\r\n</div>\r\n");}]);