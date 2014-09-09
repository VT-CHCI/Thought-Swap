'use strict';

//-------------------------------------------------------------------------
/**
 *  The login controller for the ThoughtSwap app, handles the
 *  login process' interaction with the server and by extension,
 *  the database for both teachers and students.
 *
 *  @authors Michael Stewart, Adam Barnes
 *  @version v 1.0.0  (2014)
 */
//-------------------------------------------------------------------------

angular.module('thoughtSwapApp')
    .controller('LoginCtrl', function ($scope, md5, thoughtSocket, User) {

        /**
         * Initialization
         */
        $('.teacherLogIn').hide();
        $('.studentLogIn').hide();
        $scope.sillyname = '';
        $scope.username = '';
        $scope.password = '';
        $scope.loginFailed = false;


        /**
         * Section handles logging in the teacher.
         */
        $scope.showTeacher = function() {
            $('.topLayer').hide();
            $('.teacherLogIn').show();
        };

        $scope.loginTeacher = function() {
            thoughtSocket.emit('teacher-login-attempt', {
                username: $scope.username,
                password: md5.createHash($scope.password)
            });
        };


        /**
         * Section handles logging in students.
         */
        $scope.showStudent = function() {
            $('.topLayer').hide();
            $('.studentLogIn').show();
        };

        $scope.loginStudent = function() {
            thoughtSocket.emit('student-login-attempt', $scope.sillyname);
        };

    });
