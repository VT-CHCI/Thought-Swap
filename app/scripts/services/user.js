'use strict';

angular.module('thoughtSwapApp')

	.service('User', function (thoughtSocket, $location) {
	
	this.loggedIn = function () {
		return this.authenticated;
	};

	var userService = this;
	this.username = '';
	this.uid = '';
	this.authenticated = false;

	this.loginTeacher = function(username, password) {
		thoughtSocket.emit('login-teacher', {username:username, password:password});
	};

	this.registerUser = function(username, password, email) {
	  	console.log(username, password, email);
  			thoughtSocket.emit('new-registration', 
          		{username:username, password:password, email:email});
  	};

  	thoughtSocket.on('user-logged-in', function (userInfo) {
  		console.log(userInfo);
  		userService.uid = userInfo.uid;
  		userService.username = userInfo.username;
  		userService.permissions = userInfo.permissions;
  		userService.groups = userInfo.groups;
  		userService.authenticated = true;
  		if (userInfo.teacher) {
	  		$location.path('/teacher');
  		}
  		else {
	  		$location.path('/student');
  		}
  	});

  	thoughtSocket.on('registration-failed', function (error) {
  		userService.errorMsg = error;
  	});

  	thoughtSocket.on('login-failed', function (error) {
  		userService.loginErrorMsg = error;
  	});

	thoughtSocket.on('teacher-login-attempt', function(data){
		console.log(data);
		if (data.success) {
			userService.username = data.username;
			userService.uid = data.uid;
			userService.authenticated = true;
			
		}
	});


	this.loginStudent = function(sillyname) {
		thoughtSocket.emit('login-student', {username:sillyname});
	};
});