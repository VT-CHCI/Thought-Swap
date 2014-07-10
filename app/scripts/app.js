'use strict';

angular
  .module('thoughtSwapApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'btford.socket-io'
  ])
  .factory('thoughtSocket', function (socketFactory) {
    var myIoSocket = io.connect('/');

    var thoughtSocket = socketFactory({
      ioSocket: myIoSocket
    });

    return thoughtSocket;
    // return socketFactory();
  })
  .config(function ($routeProvider) {
    $routeProvider
      // .when('/', {
      //   templateUrl: 'views/main.html',
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
      .otherwise({
        redirectTo: '/student'
      });
  });
