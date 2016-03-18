angular.module('xp-module-session', ['ngDialog', 'sessionTemplates', 'xp-form-helper', 'pascalprecht.translate']);

angular.module('xp-module-session').provider('moduleSession', function() {
  var config;
  config = {
    client_id: '',
    locale: 'ru',
    loginTemplate: null,
    registerTemplate: null
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
                  closeByDocument: false
                };
                break;
              case 'registration':
                options = {
                  template: config.loginTemplate ? config.loginTemplate : 'templates/signUp.html',
                  controller: 'SignUpCtrl',
                  closeByDocument: false
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

angular.module('xp-module-session').controller('SignInCtrl', function($auth, $scope, moduleSession, $q, xpFormHelper, $rootScope) {
  var loginPromise;
  this._form = 'signInForm';
  this.errors = {
    10: 'authData'
  };
  if (typeof errorMessage !== "undefined" && errorMessage !== null) {
    $scope.error_message = errorMessage;
  }
  loginPromise = null;
  $scope.locale = moduleSession.getConfig().locale;
  $scope.connectProvider = xpFormHelper.connectProvider;
  $scope.login = function() {
    var params;
    if ($scope.signIn.$valid && !$scope.submitInProgress) {
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
        return xpFormHelper.errorHandler(res);
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

angular.module('xp-module-session').controller('SignUpCtrl', function($auth, $scope, $q, moduleSession, xpFormHelper) {
  var registerPromise;
  this._form = 'signUpForm';
  this.errors = {
    806: 'email'
  };
  $scope.locale = moduleSession.getConfig().locale;
  registerPromise = null;
  $scope.register = function() {
    var params, password_confirm;
    if ($scope.signUpForm.$valid && !$scope.submitInProgress) {
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
        return $auth.submitLogin(post_data).then(function(res) {
          $auth.auth({
            name: $scope.email,
            roles: ['user']
          });
          return $auth.getUserInfo().then(function(user) {
            moduleSession.close();
            return registerPromise.resolve(user);
          });
        }, function(res) {
          return xpFormHelper.errorHandler(res.data);
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

angular.module("sessionTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("templates/signIn.html","<div cg-busy=\"providerPromise.promise\" class=\"module-sessions-signup ui-modal\">\n    <div class=\"modal-title\">\n        <h1>{{ \'MODAL.signin_title\' | translate }}</h1>\n    </div>\n    <form name=\"signIn\" novalidate=\"novalidate\" formfocus=\"formfocus\" valdr-type=\"signin\">\n        <p>{{ \'MODAL.session_social\' | translate }}</p>\n        <div ng-class=\" {disabled: submitInProgress} \" class=\"social\">\n            <div ng-click=\"connectProvider(\'facebook\')\" class=\"social-button social-button__fb\"></div>\n            <div ng-click=\"connectProvider(\'naszaklasa\')\" ng-if=\"locale == \'pl\'\" class=\"social-button social-button__nk\"></div>\n            <div ng-click=\"connectProvider(\'vkontakte\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__vk\"></div>\n            <div ng-click=\"connectProvider(\'odnoklassniki\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__ok\"></div>\n            <div ng-click=\"connectProvider(\'mailru\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__mm\"></div>\n            <div ng-click=\"connectProvider(\'google\')\" ng-if=\"locale == \'en\' || locale == \'pl\'\" class=\"social-button social-button__gp\"></div>\n            <div ng-click=\"connectProvider(\'twitter\')\" ng-if=\"locale == \'en\'\" class=\"social-button social-button__tw\"></div>\n            <div ng-click=\"connectProvider(\'yahoo\')\" ng-if=\"locale == \'en\'\" class=\"social-button social-button__ya\"></div>\n        </div>\n        <div class=\"separator\">\n            <p>{{ \'MODAL.or\' | translate }}</p>\n        </div>\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\n            <label>{{ \'MODAL.session_email\' | translate }}</label>\n            <input type=\"email\" name=\"email\" ng-model=\"email\" ng-disabled=\"submitInProgress\" ng-keyup=\"clearError(10)\"/>\n        </div>\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\n            <label>{{ \'MODAL.session_password\' | translate }}</label>\n            <input type=\"password\" name=\"password\" ng-model=\"password\" ng-disabled=\"submitInProgress\" ng-keyup=\"clearError(10)\"/>\n        </div>\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\n            <input type=\"checkbox\" name=\"remember\" ng-model=\"remember\" ng-disabled=\"submitInProgress\"/>{{ \'MODAL.session_remember\' | translate }}\n        </div>\n        <div class=\"form-button\">\n            <button ng-click=\"login()\" cg-busy=\"{promise:loginPromise,wrapperClass:\'transparent\', templateUrl: \'ui/loader/loader.html\'}\" class=\"btn btn__success\"><span ng-hide=\"submitInProgress\">{{ \'COMMON.button_signin\' | translate }}</span></button>\n        </div>\n        <div ng-if=\"!submitInProgress\" ng-show=\"error_message\" class=\"form-errors\">{{ error_message }}</div>\n        <div class=\"modal-footer\">{{ \'MODAL.session_no_account\' | translate }}&nbsp;<a ng-click=\"showSignUp()\">{{ \'COMMON.button_signup\' | translate }}</a><br/>{{ \'MODAL.forgot_password_text\' | translate }}&nbsp;<a ng-click=\"restorePassword()\">{{ \'MODAL.forgot_password_link\' | translate }}</a></div>\n    </form>\n</div>\n");
$templateCache.put("templates/signUp.html","<div cg-busy=\"{promise:providerPromise.promise,templateUrl:\'ui/loader/fill-loader.html\'}\" class=\"module-sessions-signup ui-modal\">\n    <div class=\"modal-title\">\n        <h1>{{ \'MODAL.signup_title\' | translate }}</h1>\n    </div>\n    <form name=\"signUpForm\" novalidate=\"novalidate\" valdr-type=\"sessions\">\n        <p>{{ \'MODAL.session_social\' | translate }}</p>\n        <div ng-class=\" {disabled: submitInProgress} \" class=\"social\">\n            <div ng-click=\"connectProvider(\'facebook\')\" class=\"social-button social-button__fb\"></div>\n            <div ng-click=\"connectProvider(\'naszaklasa\')\" ng-if=\"locale == \'pl\'\" class=\"social-button social-button__nk\"></div>\n            <div ng-click=\"connectProvider(\'vkontakte\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__vk\"></div>\n            <div ng-click=\"connectProvider(\'odnoklassniki\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__ok\"></div>\n            <div ng-click=\"connectProvider(\'mailru\')\" ng-if=\"locale == \'ru\'\" class=\"social-button social-button__mm\"></div>\n            <div ng-click=\"connectProvider(\'google\')\" ng-if=\"locale == \'en\' || locale == \'pl\'\" class=\"social-button social-button__gp\"></div>\n            <div ng-click=\"connectProvider(\'twitter\')\" ng-if=\"locale == \'en\'\" class=\"social-button social-button__tw\"></div>\n            <div ng-click=\"connectProvider(\'yahoo\')\" ng-if=\"locale == \'en\'\" class=\"social-button social-button__ya\"></div>\n        </div>\n        <div class=\"separator\">\n            <p>{{ \'MODAL.or\' | translate }}</p>\n        </div>\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\n            <label>{{ \'MODAL.session_email\' | translate }}</label>\n            <input type=\"email\" name=\"email\" ng-model=\"email\" ng-keyup=\"clearError(806)\" ng-disabled=\"submitInProgress\"/>\n        </div>\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\n            <label>{{ \'MODAL.session_password\' | translate }}</label>\n            <input type=\"password\" name=\"password\" ng-model=\"password\" ng-disabled=\"submitInProgress\"/>\n        </div>\n        <div valdr-form-group=\"valdr-form-group\" class=\"control control-input\">\n            <label>{{ \'MODAL.session_nick\' | translate }}</label>\n            <input type=\"text\" name=\"display-name\" ng-model=\"display_name\" maxlength=\"20\" ng-disabled=\"submitInProgress\"/>\n        </div>\n        <div class=\"form-button\">\n            <p translate=\"{{\'MODAL.register_text\'}}\" class=\"mute\"></p>\n            <button ng-click=\"register()\" cg-busy=\"{promise:registerPromise,wrapperClass:\'transparent\', templateUrl: \'ui/loader/loader.html\'}\" class=\"btn btn__success\"><span ng-hide=\"submitInProgress\">{{ \'COMMON.button_join\' | translate }}</span></button>\n        </div>\n        <div ng-if=\"!submitInProgress\" ng-show=\"error_message\" class=\"form-errors\">{{ error_message }}</div>\n        <div class=\"modal-footer\">{{ \'MODAL.session_have_account\' | translate }}&nbsp;<a ng-click=\"showSignIn()\">{{ \'COMMON.button_signin\' | translate }}</a></div>\n    </form>\n</div>\n");}]);