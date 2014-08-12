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
      .when('/teacher', {
        templateUrl: 'views/teacher.html',
        controller: 'TeacherCtrl'
      })
      .when('/registration', {
        templateUrl: 'views/registration.html',
        controller: 'RegistrationCtrl'
      })
      .otherwise({
        redirectTo: '/student'
      });
  });
