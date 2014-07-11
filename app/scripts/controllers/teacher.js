'use strict';

angular.module('thoughtSwapApp')
  .controller('TeacherCtrl', function ($scope, thoughtSocket) {
    thoughtSocket.emit('teacher');
  	// Associative Array to hold unique students and their thoughts
  	$scope.studentThoughts = {};

  	// Button functionality for joining the teacher room
  	$scope.getStarted = function() {
  		
  	}

  	// Button functionality for distributing thoughts randomly among students
  	$scope.distribute = function() {
  		thoughtSocket.emit('distribute');
  	}

  	// Listens for new thoughts from students and changes studentThoughts accordingly
  	thoughtSocket.on('new-thought-from-student', function(newThought){
      console.log('recived thought!', newThought);
      $scope.studentThoughts[newThought.id] = newThought.thought;
    });

  });
