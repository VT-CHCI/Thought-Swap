'use strict';

angular.module('thoughtSwapApp')
  .controller('TeacherCtrl', function ($scope, thoughtSocket) {
  	$scope.studentThoughts = {};
  	$scope.getStarted = function() {
  		thoughtSocket.emit('teacher');
  	}

  	thoughtSocket.on('new-thought', function(newThought){
      console.log('recived thought!', newThought);
      $scope.studentThoughts[newThought.id] = newThought.thought;
    });
  });
