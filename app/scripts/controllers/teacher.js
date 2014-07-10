'use strict';

angular.module('thoughtSwapApp')
  .controller('TeacherCtrl', function ($scope, thoughtSocket) {
  	// Associative Array to hold unique students and their thoughts
  	$scope.studentThoughts = {};

  	// Button functionality for joining the teacher room
  	$scope.getStarted = function() {
  		thoughtSocket.emit('teacher');
  	}

  	// Listens for new thoughts from students and changes studentThoughts accordingly
  	thoughtSocket.on('new-thought', function(newThought){
      console.log('recived thought!', newThought);
      $scope.studentThoughts[newThought.id] = newThought.thought;
    });
    
  });
