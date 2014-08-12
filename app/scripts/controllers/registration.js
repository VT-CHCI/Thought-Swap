'use strict';

//-------------------------------------------------------------------------
/**
 *  The registration controller for the ThoughtSwap app, handles the
 *  registration process' interaction with the server and by extension,
 *  the database.
 *
 *  @authors Michael Stewart, Adam Barnes
 *  @version v 1.0.0  (2014)
 */
//-------------------------------------------------------------------------

angular.module('thoughtSwapApp')
	.controller('RegistrationCtrl', function ($scope, thoughtSocket) {

  	$('.layer2').hide();
  	$scope.username;
  	$scope.password;
  	$scope.email;

  	console.log($scope.username, $scope.password, $scope.email);

 	username = $scope.username;
  	password = $scope.password;
  	email = $scope.email;
  	
  	console.log($scope.username, $scope.password, $scope.email);

  	// check for uniqueness in username and password

});