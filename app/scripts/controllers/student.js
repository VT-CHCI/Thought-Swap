'use strict';

angular.module('thoughtSwapApp')
  .controller('StudentCtrl', function ($scope, thoughtSocket) {
    thoughtSocket.emit('student');
    $('.otherThought').hide();
    // Array to hold all of the student's previous thoughts
    $scope.thoughtPool = [];

    //
    $scope.randomThought = '';

    // Handles textarea input and usability
    $scope.thoughtIn = function () {
      console.log('thoughtIn!');
      console.log($scope.newThought );
      $scope.thoughtPool.push($scope.newThought);
      thoughtSocket.emit('new-thought-from-student', $scope.newThought);
      $scope.newThought = '';
      $('textarea').focus();
    };

    // Listens for input from connected students and logs their input in thoughtPool
    thoughtSocket.on('new-thought-from-student', function(newThought){
      console.log('got a new thought!', newThought);
      $scope.thoughtPool.push(newThought);
    });

    //
    thoughtSocket.on('new-distribution', function(randomThought) {
      console.log('other thought recieved');
      $scope.randomThought = randomThought;
      $('.otherThought').show();
      $('.input').hide();
      $('.history').hide();
    });
  });
