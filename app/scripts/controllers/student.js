'use strict';

//-------------------------------------------------------------------------
/**
 *  The student controller for the ThoughtSwap app, handles student
 *  interaction with the server and provides real-time updates to the
 *  student view.
 *
 *  @authors Michael Stewart, Adam Barnes
 *  @version v 1.0.0  (2014)
 */
//-------------------------------------------------------------------------

angular.module('thoughtSwapApp')
  .controller('StudentCtrl', function ($scope, thoughtSocket, User, $routeParams) {

    $scope.userService = User;
    var studentCtrlScope = $scope;

    /**
     * Will tell the server to put this client in the student room.
     */
    thoughtSocket.emit('student', $routeParams.groupId);
    console.log('Joined as student')

    /**
     * ~~ Initialization ~~
     * Hides the other-thought update initially and provides variables
     * for the controller's other functions.
     */
    $('.otherThought').hide();
    $scope.thoughtPool = [];
    $scope.randomThought = '';
    $scope.question = '';

    /**
     * Will update the view and inform the server whenever a thought is
     * submitted by the student. Resets the textarea for further input.
     */
    $scope.thoughtIn = function () {
      //console.log('Thought Recieved!');
      $scope.thoughtPool.push({thought:$scope.newThought});
      console.log($scope.newThought);
      thoughtSocket.emit('new-thought-from-student', $scope.newThought);
      $scope.newThought = '';
      $('textarea').focus();
    };

    /**
     * Will catch when a teacher initiates a new session and reset all
     * possible changes to the initial state.
     */
    thoughtSocket.on('new-session', function () {
      console.log('reseting session...');
      $('.otherThought').hide();
      $('.input').show()
      studentCtrlScope.thoughtPool = [];
      studentCtrlScope.randomThought = '';
      studentCtrlScope.question = '';
    });

    /**
     * Will catch when the server attempts to sync an existing prompt
     * to the student view.
     */
     thoughtSocket.on('prompt-sync', function (newQuestion) {
       console.log('Prompt is syncing', newQuestion);
       studentCtrlScope.question = newQuestion;
     });

    /**
     * Will catch when the server sends out a prompt from the teacher
     * and update the view accordingly.
     */
    thoughtSocket.on('new-prompt', function (newPrompt) {
      console.log('got a prompt!');
      studentCtrlScope.question = newPrompt;
    });

    /**
     * Will catch when the teacher has distributed the thoughts of the
     * other students and proceed to update the view with one thought
     * besides their own.
     */
    thoughtSocket.on('new-distribution', function (randomThought) {
      console.log('other thought recieved', randomThought);
      studentCtrlScope.randomThought = randomThought;
      $('.input').hide();
      $('.otherThought').show();
    });

  });
