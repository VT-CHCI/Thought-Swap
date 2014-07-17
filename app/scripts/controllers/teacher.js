'use strict';

angular.module('thoughtSwapApp')
  .controller('TeacherCtrl', function ($scope, thoughtSocket) {
    thoughtSocket.emit('teacher');

    // Have num_connected update at a time interval?

  	// Associative Array to hold unique students and their thoughts
  	$scope.studentThoughts = {};

    //
    $scope.num_thoughts = 0;
    $scope.num_submitters = 0;
    $scope.num_connected = 0;

  	// Button functionality for distributing thoughts randomly among students
  	$scope.distribute = function() {
  		thoughtSocket.emit('distribute');
  	}

  	// Listens for new thoughts from students and changes studentThoughts accordingly
  	thoughtSocket.on('new-thought-from-student', function(newThought){
      console.log('recived thought!', newThought);
      $scope.studentThoughts[newThought.id] = newThought.thought;
      $scope.num_thoughts = thoughts;
    });

    thoughtSocket.on('thought-sync', function(allThoughts) {
      console.log('teacher is synced');
      $scope.studentThoughts = allThoughts;
      $scope.num_connected = connectedStudents;
    })

  });
