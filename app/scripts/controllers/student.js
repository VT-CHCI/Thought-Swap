'use strict';

angular.module('thoughtSwapApp')
  .controller('StudentCtrl', function ($scope, thoughtSocket) {
    $scope.previousThoughts = [];
    $scope.thoughtIn = function () {
      console.log('thoughtIn!');
      console.log($scope.newThought );
      $scope.previousThoughts.push($scope.newThought);
      thoughtSocket.emit('new-thought', $scope.newThought);
      $scope.newThought = '';
      $('textarea').focus();
    };

    thoughtSocket.on('new-thought-from-peer', function(newThought){
      console.log('got a new thought!', newThought);
      $scope.previousThoughts.push(newThought);
    });
  });
