'use strict';


angular
  .module('thoughtSwapApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'btford.socket-io',
    'ui.bootstrap',
    'ui.sortable',
    'truncate',
    'angular-md5',
  ])

  // Creates the thoughtSocket that controllers will be listening in on
  .factory('thoughtSocket', function (socketFactory) {
    var myIoSocket = io.connect('/');

    var thoughtSocket = socketFactory({
      ioSocket: myIoSocket
    });

    return thoughtSocket;
  })

  // Preloads the various views of the app
  .config(function ($routeProvider) {
    $routeProvider
      // .when('/', {
      //   templateUrl: 'views/main.html',  // Commented out until work on landing page is a priority.
      //   controller: 'MainCtrl'
      // })
      .when('/student', {
        templateUrl: 'views/student.html',
        controller: 'StudentCtrl'
      })
      .when('/teacher/:groupId', {
        templateUrl: 'views/teacher.html',
        controller: 'TeacherCtrl'
      })
      .when('/teacher', {
        templateUrl: 'views/teacher-admin.html',
        controller: 'TeacherAdminCtrl'
      })
      .when('/registration', {
        templateUrl: 'views/registration.html',
        controller: 'RegistrationCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .otherwise({
        redirectTo: '/student'
      });
  });
