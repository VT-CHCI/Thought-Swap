'use strict';

//-------------------------------------------------------------------------
/**
 *  The teacher controller for the ThoughtSwap app, handles teacher
 *  interaction with the server and provides real-time updates to the
 *  teacher view.
 *
 *  @authors Michael Stewart, Adam Barnes
 *  @version v 1.0.0  (2014)
 */
//-------------------------------------------------------------------------

angular.module('thoughtSwapApp')
    .controller('TeacherCtrl', function ($scope, thoughtSocket, User, $routeParams) {
        console.log($routeParams.groupId);

        $scope.userService = User;
        var teacherCtrlScope = $scope;

        /**
         * Will tell the server to put this client in the teacher room.
         */
        thoughtSocket.emit('teacher', $routeParams.groupId);
        console.log('Joined as Teacher');

        /**
         * ~~ Initialization ~~
         * Provides variables for the controller's other functions
         */
        $scope.studentThoughts = [];
        $scope.num_submitters = 0;
        $scope.num_connected = 0;
        $scope.currentPrompt = '';
        $scope.studentThoughts = [];
        // $scope.canDistribute = false;

<<<<<<< HEAD
    /**
     * Will tell everyone connected that a new session is begining
     * and reset the thoughts the teacher has recieved.
     */
    $scope.newSession = function () {
      console.log('new session started');
      thoughtSocket.emit('new-session');
      $scope.studentThoughts = [];
      $scope.num_submitters = 0;
      $('.promptRequest').show();
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
=======
        // /**
        //  * Will tell the controller that distribution is now okay.
        //  */
        // thoughtSocket.on('enough-submitters', function() {
        //   $scope.canDistribute = true;
        // });

        /**
         * Will tell the server to begin its distribution process.
         */
        $scope.distribute = function() {
            // if (canDistribute) {
                thoughtSocket.emit('distribute');
            // }
        };
>>>>>>> feature/database_persistence_and_accounts

        /**
         * Will tell everyone connected that a new session is begining
         * and reset the thoughts the teacher has recieved.
         */
        $scope.newSession = function() {
            console.log('new session started');
            thoughtSocket.emit('new-session');
            $scope.studentThoughts = [];
            $scope.num_submitters = 0;
            $('.enterPrompt').show();
            $scope.newPrompt = '';
            $('textarea').focus();
        };

        /**
         * Will tell the server that there is a new thought to be passed
         * along to students. Prevents the area from any further input.
         */
        $scope.promptIn = function() {
            console.log('Prompt Recieved!');
            thoughtSocket.emit('new-prompt', $scope.newPrompt);
            $('.enterPrompt').hide();
        };

        /**
         * Will catch when a student has submitted their thought and
         * update studentThoughts accordingly.
         */
        thoughtSocket.on('new-thought-from-student', function(newThought) {
            console.log('received thought!', newThought);
            teacherCtrlScope.studentThoughts.push({
                thought: newThought
            });
        });

        /**
         * Will catch when the server tries to sync with the teacher and
         * update the view with data that comes with the sync.
         */
        thoughtSocket.on('thought-sync', function(data) {
            console.log('teacher is synced', data);
            teacherCtrlScope.num_connected = data.connected;
            teacherCtrlScope.studentThoughts = data.thoughts;
            teacherCtrlScope.num_submitters = data.submitters;
        });

        /**
         * Will catch whenever the server has an update for the amount of connected
         * students and update the view accordingly.
         */
        thoughtSocket.on('num-students', function(connectedStudents) {
            console.log(connectedStudents);
            teacherCtrlScope.num_connected = connectedStudents;
        });

    });
