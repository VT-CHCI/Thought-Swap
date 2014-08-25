'use strict';

//-------------------------------------------------------------------------
/**
 *  The controller for the teacher's admin view of the ThoughtSwap app, 
 *  handles teacher interaction with the server and provides a way to view
 *  and modify classes of students.
 *
 *  @authors Michael Stewart, Adam Barnes
 *  @version v 1.0.0  (2014)
 */
//-------------------------------------------------------------------------

angular.module('thoughtSwapApp')
  .controller('TeacherAdminCtrl', function ($scope, thoughtSocket, User, $routeParams, $location) {
    console.log($routeParams.groupId);

    $scope.userService = User;

    console.log('This is the teacher admin view');

    $scope.class_name = '';
    $scope.number = 0;
    $scope.groups = [];

    console.log(User.teacherLoggedIn());
    if (User.teacherLoggedIn()) {
      $scope.groups = User.getGroups();
    } 
    else {
      console.log("Not logged in");
      $location.path('/login/teacher');
    }

    $scope.createClass = function() {
      console.log("CREATE A CLASS");
      thoughtSocket.emit('create-class', $scope.class_name, $scope.number);
    }


    thoughtSocket.on('class-created', function(name, number, students) {
      
    });

 });