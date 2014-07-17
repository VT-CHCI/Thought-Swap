'use strict';

angular.module('thoughtSwapApp')
  .controller('TeacherCtrl', function ($scope, thoughtSocket) {
    console.log('teacher getting started')
    thoughtSocket.emit('teacher');
    // Have num_connected update at a time interval?

  	// Associative Array to hold unique students and their thoughts
  	$scope.studentThoughts = {};

    //
    // $scope.num_thoughts = 0;
    $scope.num_submitters = 0;
    $scope.num_connected = 0;

  	// Button functionality for distributing thoughts randomly among students
  	$scope.distribute = function() {
  		thoughtSocket.emit('distribute');
  	}

  	// Listens for new thoughts from students and changes studentThoughts accordingly
  	thoughtSocket.on('new-thought-from-student', function(newThought, thoughts, submitters){
      console.log('recived thought!', newThought);
      $scope.studentThoughts[newThought.id] = newThought.thought;

      // $scope.num_thoughts = thoughts;
      //$scope.num_submitters = submitters;
    });

    thoughtSocket.on('thought-sync', function(data) {

      console.log('teacher is synced');
      $scope.num_connected = data.connected;
      $scope.studentThoughts = data.thoughts;
    });

    thoughtSocket.on('num-students', function(connectedStudents) {
      console.log(connectedStudents);
      $scope.num_connected = connectedStudents; //current method of eliminating teacher from student count, assumes 1 teacher
    });

  });
