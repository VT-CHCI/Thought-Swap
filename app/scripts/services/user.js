'use strict';

angular.module('thoughtSwapApp')
    .service('User', function(thoughtSocket, $location) {

        /**
         * Initialization
         */
        var userService = this;
        this.username = '';
        this.uid = '';
        this.authenticated = false;
        this.studentAuthenticated = false;
        this.groups = [];
        this.currentGroup = 0;

        /**
         * Getter and Setter Methods Associated with the User Service
         */
        this.getUserName = function() {
            return userService.username;
        };

        this.getUserId = function() {
            return userService.uid;
        };

        this.getGroups = function() {
            return userService.groups;
        };

        this.getCurrentGroup = function() {
            return userService.currentGroup;
        };

        this.setGroup = function(groupId) {
            userService.currentGroup = groupId;
        };
        /* ~~~~ */

        /**
         * Takes data from the server and assigns it appropriately to
         * the correct fields.
         */
        thoughtSocket.on('teacher-logged-in', function(teacherInfo) {
            // teacherInfo = {uid: SqlID, username: ~~, permissions: ~~ ,groups: ~~,teacher: true}
            console.log(teacherInfo);
            userService.uid = teacherInfo.uid;
            userService.username = teacherInfo.username;
            userService.authenticated = true;
            $location.path('teacher-admin/');

        });

        thoughtSocket.on('student-logged-in', function(studentInfo) {
            //studentInfo is an array of "group" or class objects for now just use the 0th one
            console.log(studentInfo);
            userService.uid = studentInfo.uid;
            userService.username = studentInfo.username;
            userService.authenticated = true;
            $location.path('student/' + studentInfo.groupId);
        });

        /**
         * Subservice that checks for authentication for the teacher view. Allows
         * access only to the teacher who has logged in.
         */
        this.teacherLoggedIn = function() {
            return userService.authenticated;
        };

        /**
         * Subservice that sets fields back to their orignally blank states.
         */
        this.logOut = function() {
            userService.username = '';
            userService.uid = '';
            userService.authenticated = false;
            userService.studentAuthenticated = false;
            this.groups = [];
            this.currentGroup = 0;
            $location.path('/login');
        }

        /**
         * Subservice that checks for authentication for the student view. Allows
         * access to the student view for both students and teachers who've logged in.
         */
        this.studentLoggedIn = function() {
            return (userService.studentAuthenticated || userService.authenticated);
        };

        /**
         * Takes data from the server concerning troubleshooting in the login
         * or registration process and relays it appropriately.
         */
        thoughtSocket.on('registration-failed', function(error) {
            userService.errorMsg = error;
        });

        thoughtSocket.on('login-failed', function(error) {
            userService.loginErrorMsg = error;
        });
        /* ~~~~ */


        thoughtSocket.on('load-classes', function(results) {
            console.log(results);
            var classes = [];
            /**
             * Loop over all results, produce class structure with students
             */
            for (var i = 0; i < results.length; i++) {
                var users = [];
                for (var j = 0; j < results.length; j++) {
                    if (results[i].name == results[j].name) {
                        users.push({
                            name: results[j].username,
                            id: results[j].uid
                        });
                        i = j;
                    }
                }
                classes.push({
                    class_name: results[i].name,
                    group_id: results[i].group_id,
                    users: users
                });
            }
            userService.groups = classes;
            console.log(userService.groups);
        });

        thoughtSocket.on('class-created', function(name, number, groupId, studentNames) {
            userService.groups.push({
                class_name: name,
                group_id: groupId,
                number: number,
                users: studentNames
            });
        });


    });
