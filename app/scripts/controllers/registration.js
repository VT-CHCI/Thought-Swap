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
	.controller('RegistrationCtrl', function ($scope, md5, thoughtSocket, $location, User) {

  	$('.layer2').hide();
  	$scope.username='';
  	$scope.password='';
  	$scope.email='';
  	$scope.registrationFailed = false;

  	var registrationScope = $scope;

  	$scope.registerUser = function() {
  		$scope.registrationFailed = false;

      if ($scope.username.length > 0 &&
        $scope.password.length > 0 &&
        $scope.email.length > 0) {
          User.registerUser($scope.username, md5.createHash($scope.password), $scope.email);
      }

  		

  			// thoughtSocket.emit('new-registration', 
     //      {username:$scope.username, password:md5.createHash($scope.password), email:$scope.email});
		  	
  			// User.loginTeacher($scope.username, md5.createHash($scope.password);
		  	// console.log($scope.username, md5.createHash($scope.password), $scope.email);
  		// }
  		else {
  			$scope.registrationFailed = true;
  		}
      $('.layer1').hide();
      $('.layer2').show();
  	};

});