'use strict';

//-------------------------------------------------------------------------
/**
 *	The login controller for the ThoughtSwap app, handles the
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
  	// var password = md5.createHash($scope.password);
  	$scope.loginFailed = false;

  	/**
  	 * Section handles logging in the teacher.
  	 */
  	$scope.showTeacher = function () {
  		$('.topLayer').hide();
  		$('.teacherLogIn').show();
  	};

  	$scope.loginTeacher = function () {
  		thoughtSocket.emit('login-teacher', {username: $scope.username, password:md5.createHash($scope.password)});
  	};

  	thoughtSocket.on('teacher-login-attempt', function(data){
  		console.log('success?', data.success);
  		if (data.success) {
  			$location.path('/teacher');
  		}
  		else {
  			registrationScope.registrationFailed = true;
  		}
  	});

  	//-------------------------------------------------------------------------
  	/**
  	 * Section handles logging in students.
  	 */
  	$scope.showStudent = function () {
  		$('.topLayer').hide();
  		$('.studentLogIn').show();
  	};

  	$scope.loginStudent = function (sillyname) {
  		$scope.sillyname = sillyname;
  		// Do more stuff
  	};

  	thoughtSocket.on('student-login-attempt', function (sillyname) {
  		
  	});



  	
  });