'use strict';

angular.module('thoughtSwapApp')
	.service('User', function (thoughtSocket, $location) {
	
	var userService = this;
	this.username = '';
	this.uid = '';
	this.authenticated = false;
	this.studentAuthenticated = false;
  	this.groups = [];

	this.teacherLoggedIn = function () {
	    return userService.authenticated;
	};

	this.studentLoggedIn = function () {
    	return (userService.studentAuthenticated || userService.authenticated);
  	};

	this.loginTeacher = function(username, password) {
		thoughtSocket.emit('login-teacher', {username:username, password:password});
	};

	this.logInStudent = function(name) {
    	thoughtSocket.emit('login-student', {sillyname: name});
  	};

	this.registerUser = function(username, password, email) {
	  	console.log(username, password, email);
  			thoughtSocket.emit('new-registration', 
          		{username:username, password:password, email:email});
  	};

  	this.getGroups = function() {
    	return userService.groups;
  	}

  	thoughtSocket.on('registration-failed', function (error) {
  		userService.errorMsg = error;
  	});

  	thoughtSocket.on('login-failed', function (error) {
  		userService.loginErrorMsg = error;
  	});

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


	thoughtSocket.on('classes-loaded', function(results) {
	    var classes = [];
	    for (var i = 0; i < results.length; i++) {
	      var users = [];
	      for (var j = 0; j < results.length; j++) {
	        if (results[i].name == results[j].name) {
	          users.push(results[j].username);
	          i = j;
	        }
	      }
	      classes.push({className: results[i].name, users: users});
	    }
	    userService.groups = classes;
	    console.log(userService.groups);
	});

	this.logOutTeacher = function() {
	    userService.username = '';
	    userService.uid = '';
	    userService.authenticated = false;
	    $location.path('/login');
  	}
  	
});