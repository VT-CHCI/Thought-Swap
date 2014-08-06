'use strict';

//-------------------------------------------------------------------------
/**
 *  The teacher controller for the ThoughtSwap app, handles teacher
 *  interaction with the server and provides real-time updates to the
 *  teacher view.
 *
 *  @authors Michael Stewart, Adam Barnes
 *  @version v 0.0.0  (2014)
 */
//-------------------------------------------------------------------------

angular.module('thoughtSwapApp')
  .controller('TeacherCtrl', function ($scope, thoughtSocket) {

    /**
     * Will tell the server to put this client in the teacher room.
     */
    thoughtSocket.emit('teacher');

  	/**
     * ~~ Initialization ~~
     * Provides variables for the controller's other functions
     */
  	$scope.studentThoughts = [];
    $scope.num_submitters = 0;
    $scope.num_connected = 0;

  	/**
     * Will tell the server to begin its distribution process.
     */
  	$scope.distribute = function () {
  		thoughtSocket.emit('distribute');
  	};

    /**
     * Will tell everyone connected that a new session is begining
     * and reset the thoughts the teacher has recieved.
     */
    $scope.newSession = function () {
      console.log('new session started');
      thoughtSocket.emit('new-session');
      $scope.studentThoughts = [];
      $scope.num_submitters = 0;
      $('.enterPrompt').show();
      $scope.newPrompt = '';
      $('textarea').focus();
    }

    /**
     * Will tell the server that there is a new thought to be passed
     * along to students. Prevents the area from any further input.
     */
    $scope.promptIn = function () {
      console.log('Prompt Recieved!');
      thoughtSocket.emit('new-prompt', $scope.newPrompt);
      $('.promptRequest').hide();
    };

  	/**
     * Will catch when a student has submitted their thought and
     * update studentThoughts accordingly.
     */
  	thoughtSocket.on('new-thought-from-student', function(newThought){
      //console.log('recived thought!', newThought);
      $scope.studentThoughts.push({thought:newThought});
    });

    /**
     * Will catch when the server tries to sync with the teacher and
     * update the view with data that comes with the sync.
     */
    thoughtSocket.on('thought-sync', function(data) {
      console.log('teacher is synced');
      $scope.num_connected = data.connected;
      $scope.studentThoughts = data.thoughts;
      $scope.num_submitters = data.submitters;
    });

    /**
     * [FLAGGED for Deletion] - (Server never sends this message to anyone)
     * Will catch whenever the server has an update for the amount of
     * submitters.
     */
    thoughtSocket.on('num-submitters', function(submitters) {
      $scope.num_submitters = submitters;
    });

    /**
     * Will catch whenever the server has an update for the amount of connected
     * students and update the view accordingly.
     */
    thoughtSocket.on('num-students', function(connectedStudents) {
      console.log(connectedStudents);
      $scope.num_connected = connectedStudents;
    });

  });
