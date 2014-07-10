'use strict';

angular.module('thoughtSwapApp')
  .controller('StudentCtrl', function ($scope, thoughtSocket) {
    $scope.thoughtPool = [];
    $scope.thoughtIn = function () {
      console.log('thoughtIn!');
      console.log($scope.newThought );
      $scope.thoughtPool.push($scope.newThought);
      thoughtSocket.emit('new-thought', $scope.newThought);
      $scope.newThought = '';
      $('textarea').focus();
    };

    thoughtSocket.on('new-thought-from-student', function(newThought){
      console.log('got a new thought!', newThought);
      $scope.thoughtPool.push(newThought);
    });
  });
