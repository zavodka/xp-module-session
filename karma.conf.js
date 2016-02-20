var testMinified = process.argv.indexOf('--min') > -1,
    subject;

if (testMinified) {
  subject = 'dist/client-auth.min.js';
  console.log('Testing minifed client-auth');
} else {
  subject = 'src/client-auth.js';
}

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      subject,
      'test/**/*.js'
    ],
    port: 9877,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: false,
    preprocessors: {
      'src/client-auth.coffee': ['coffee']
    },
    plugins: [
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
      'karma-jasmine',
      'karma-coffee-preprocessor'
    ]
  });
};
