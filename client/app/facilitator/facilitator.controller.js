(function () {
    'use strict';

    angular.module('app')
        .controller('FacilitatorController', FacilitatorController);

    FacilitatorController.$inject = ['$scope', '$uibModal', '$log', 'ThoughtSocket',
        'UserService', '$location', '$routeParams', '$rootScope', '$timeout',
        'toastr', '$animate', 'LoggerService'
    ];

    function FacilitatorController($scope, $modal, $log, ThoughtSocket,
        UserService, $location, $routeParams, $rootScope, $timeout,
        toastr, $animate, Logger) {

        (function initController() {
            $scope.agreedThoughts=0;
            $scope.disagreedThoughts=0;
            $scope.disributedThoughts = [];
            $scope.participantThoughts = [];
            $scope.prompt = {};
            $scope.numSubmitters = 0;
            $scope.numConnected = 0;
            $scope.dataLoading = true;
            $scope.ngmSettings = {
                closeEl: '.close',
                overlay: {
                    templateUrl: 'app/facilitator/partials/thoughtOverlay.html'
                }
            };


            ThoughtSocket.emit('facilitator-join', {
                groupId: $routeParams.groupId,
                userId: UserService.user.id
            });

            $scope.BG_COLORS = {
                // 1: 'red',
                // 2: 'orange',
            };

            ThoughtSocket.on('group-colors', function (colors) {
                console.log('group-colors', colors);
                colors.forEach(function (color) {
                    $scope.BG_COLORS[color.id] = color;
                });
            });

        })();

        // TEMP METHOD: Test thoughts - adds some thoughts automatically to the
        // teacher view for ui testing.
        // $scope.testThoughts = function () {
        //     console.log("got testThoughts cmd");
        //     for (var i = 0; i < 16; i++) {
        //         Logger.createEvent({
        //             data: 'content: ' + i + " Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        //         });
        //         $scope.participantThoughts.push({
        //             localIdx: $scope.participantThoughts.length,
        //             content: i + " Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        //         });
        //     }
        // };

        $scope.animatedBounce = function (elemId) {
            $animate.addClass($(elemId), 'animated bounce')
            // .then(function () {
            //     $timeout(function () {
            //         $animate.removeClass($('#numConnected'), 'animated bounce');
            //     }, 1000);
            // });
        };

        $scope.$watch('participantThoughts.length', function (nv, ov) {
            console.log('update to numThoughts');
            if (nv !== ov) {
                $scope.animatedBounce('#numThoughts');
            }
        });

        $scope.$watch('numSubmitters', function (nv, ov) {
            if (nv !== ov) {
                $scope.animatedBounce('#numSubmitters');
            }
        });

        // $scope.$watch('numConnected', function (nv, ov) {
        //     if (nv !== ov) {
        //         $scope.animatedBounce('#numConnected');
        //     }
        // });

        $scope.thoughtMoved = function (idx) {
            $scope.participantThoughts.splice(idx, 1);
            $scope.updateLocalIdx();
        };

        ThoughtSocket.on('facilitator-prompt', function (data) {
            console.log('facilitator-prompt', data);
            $scope.prompt = data;
            $scope.participantThoughts = [];
            toastr.success('', 'New Prompt Created');
        });

        /*Agree
          ThoughtSocket.on('distributed-thought', function (thought) {
            $scope.thoughts = thought;
            if(thoughts.hasOwnProperty('agrees') && thoughts.agrees !== null) {
                $scope.agreedThoughts++;
            }
            else if(!thoughts.hasOwnProperty('agrees') && thoughts.agrees !== null){
               $scope.disagreedThoughts++;
           }

        });*/
            ThoughtSocket.on('newAgree', function () {
                $scope.agreedThoughts++;
            });

            ThoughtSocket.on('newDisagree', function () {
                $scope.disagreedThoughts++;
            });

            ThoughtSocket.on('distributed-thought', function (thought) {
            $scope.distributedThoughts.push(thought);
            $scope.distributedThoughts.forEach(function (tht) {
                if(tht.hasOwnProperty('agrees') && tht.agrees !== null) {
                $scope.agreedThoughts++;
            }
            else if(!tht.hasOwnProperty('agrees') && tht.agrees !== null){
               $scope.disagreedThoughts++;
           }
        });
        });
          

        //End

        // ThoughtSocket.on('participant-join', function () {
        //     console.log('participant-join');
        //     $scope.numConnected++;
        // });

        ThoughtSocket.on('participant-leave', function () {
            console.log('participant-leave');
            $scope.numConnected--;
        });

        ThoughtSocket.on('sessionsyncres', function (data) {
            console.log('Recieved session sync response:', data);
            // $scope.participantThoughts = data.prompt.get('thoughts'); 
            //TODO: at somepoint sync should send us the existing thoughts if we're late joining
            if (Object.keys($scope.prompt).length === 0 && JSON.stringify($scope.prompt) === JSON.stringify({})) {
                $scope.prompt = data.prompt;
                $scope.sessionId = data.sessionId;
                if (data && data.hasOwnProperty('prompt') && data.prompt &&
                    data.prompt.hasOwnProperty('thoughts') && data.prompt.thoughts &&
                    Array.isArray(data.prompt.thoughts)) {
                    $scope.participantThoughts = data.prompt.thoughts;

                    // Added to sync number of submitters even after refreshing the screen
                    participantThought.localIdx = $scope.participantThoughts.length;
                    $scope.participantThoughts.push(participantThought);
                    var submitters = [];
                    $scope.participantThoughts.forEach(function (thought) {
                        if (submitters.indexOf(thought.userId) < 0) {
                            submitters.push(thought.userId);
                        }
                    });
                    $scope.numSubmitters = submitters.length;

                    //Added to sync agree/disagree numbers even after refreshing the screen
                    for(var i = 0; data.distributions.length; i++)
                    {
                        if (data.distributions[i].agrees === true)
                            $scope.agreedThoughts++;
                        else
                            $scope.disagreedThoughts++;
                    }
                }
            }
            // $scope.numThoughts = data.prompt.thoughts.length();
            // $scope.numSubmitters = ?
        });

        $scope.newSession = function () {
            $scope.participantThoughts = [];
            //$scope.numThoughts = 0;
            $scope.numSubmitters = 0;
            $scope.agreedThoughts = 0;
            $scope.disagreedThoughts = 0;
            ThoughtSocket.emit('session-sync-req', {
                userId: UserService.user.id,
                groupId: $routeParams.groupId,
                sessionId: $scope.sessionId
            });
            Logger.createEvent({
                data: 'new session for group: ' + $routeParams.groupId,
                type: 'newSession'
            });
            toastr.success('', 'Started New Session');
        };

        ThoughtSocket.on('new-session-prompt', function (prompt) {
            console.log("Got data in new-session-prompt", prompt);
            // $scope.prompt = {};
            $scope.prompt = prompt;
            $scope.sessionId = prompt.sessionId;
        });

        $scope.openPromptInput = function () {
            // $scope.newSession();
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'app/facilitator/partials/promptModal.html',
                controller: 'PromptModalController',
                resolve: {
                    prompt: function () {
                        return $scope.prompt;
                    },
                    sessionId: function () {
                        return $scope.sessionId;
                    }
                }
            });

            modalInstance.result.then(function (newPromptContent) {
                $scope.prompt = {};
                $scope.prompt.content = newPromptContent;
            });
        };

        ThoughtSocket.on('participant-thought', function (participantThought) {
            console.log(participantThought);
            participantThought.localIdx = $scope.participantThoughts.length;
            $scope.participantThoughts.push(participantThought);
            var submitters = [];
            $scope.participantThoughts.forEach(function (thought) {
                if (submitters.indexOf(thought.userId) < 0) {
                    submitters.push(thought.userId);
                }
            });
            $scope.numSubmitters = submitters.length;
        });



        ThoughtSocket.on('group-chosen', function (info) {
            console.log('group-chosen', info);
            $scope.participantThoughts.forEach(function (thought) {
                console.log(thought, thought.id === info.thoughtId);
                if (thought.id === info.thoughtId) {
                    // thought.style
                    if (!thought.hasOwnProperty('colors')) {
                        thought.colors = {};
                    }
                    // console.log($scope.BG_COLORS);
                    // console.log(info.thoughtGroupId);
                    // console.log($scope.BG_COLORS[info.thoughtGroupId]);

                    thought.colors[info.presenter] = $scope.BG_COLORS[info.thoughtGroupId];
                }
            });
        });

        $scope.thoughtStyle = function (thought) {
            if (!thought.hasOwnProperty('colors')) {
                return '';
            } else {
                var colors = [];
                Object.keys(thought.colors).forEach(function (color) {
                    colors.push(thought.colors[color]);
                });

                var theStyle = {};
                if (colors.length === 1) {
                    theStyle = {
                        'background-color': colors[0].color,
                        'color': colors[0].text
                    };
                } else {
                    theStyle = {
                        'background': 'linear-gradient(135deg, ' + colors.map(function (clr) {
                            return clr.color;
                        }).join(',') + ')',
                        'color': '#000000'
                    };
                }
                console.log(theStyle);
                return theStyle;
            }
        };

        //added for agree-disgree option
        $scope.distributeOption = function () {
            document.getElementById("distributeOpt").style.visibility = "visible";
            document.getElementById("distributeOpt").classList.toggle("show");
        };

        //added for distribute with agree-disgree option
        $scope.distribute = function () {
                ThoughtSocket.emit('distribute', {
                groupId: $routeParams.groupId,
                promptId: $scope.prompt.id,
                sessionId: $scope.sessionId,
                shouldAgree: true
            });
            Logger.createEvent({
                data: 'distributing thoughts for groupId: ' +
                    $routeParams.groupId + ', promptId: ' + $scope.prompt.id,
                type: 'distribution'
            });
            toastr.success('', 'Thoughts Distributed!');
            document.getElementById("distributeOpt").style.visibility = "hidden";
               
        };

        //added for distribute without agree-disgree option
        $scope.distributeWithout = function () {
            ThoughtSocket.emit('distribute', {
                groupId: $routeParams.groupId,
                promptId: $scope.prompt.id,
                sessionId: $scope.sessionId,
                shouldAgree: false
            });
            Logger.createEvent({
                data: 'distributing thoughts for groupId: ' +
                    $routeParams.groupId + ', promptId: ' + $scope.prompt.id,
                type: 'distribution'
            });
            toastr.success('', 'Thoughts Distributed!');
            document.getElementById("distributeOpt").style.visibility = "hidden";
        };
        //end of added for distribute without agree-disgree option

        $scope.updateLocalIdx = function () {
            $scope.participantThoughts.forEach(function (thought, newIdx) {
                thought.idx = newIdx;
            });
        };

        $scope.deleteThought = function (thoughtIndex) {
            var removed = $scope.participantThoughts.splice(thoughtIndex, 1);
            if (removed.length > 0) {
                ThoughtSocket.emit('fac-delete-thought', {
                    thoughtId: removed[0].id
                });
                $scope.updateLocalIdx();
                Logger.createEvent({
                    data: UserService.user.username +
                        ' Deleted thought with content: ' + removed[0],
                    type: 'deleteThought'
                });
            }
        };

        $scope.displayThought = function (thought) {
            return thought.content;
        };  

    } // End FacilitatorController


    /**
     * @ngdoc The controller for the modal that handles prompt input.
     * @name PromptModal 
     * @description
     * # From Docs: Please note that $modalInstance represents a modal 
     *   window (instance) dependency. It is not the same as the $modal
     *   service used above. 
     * # Included within this controller file because it
     *   is tightly related to the above controller
     */
    angular.module('app')
        .controller('PromptModalController', PromptModalController);

    PromptModalController.$inject = ['$scope', '$uibModalInstance', 'sessionId',
        'ThoughtSocket', 'UserService', '$routeParams', 'LoggerService'
    ];

    function PromptModalController($scope, $modalInstance, sessionId,
        ThoughtSocket, UserService, $routeParams, Logger) {

        $scope.newPromptContent = '';
        $scope.sessionId = sessionId;

        $scope.submit = function () {
            console.log("Submit works");
            console.log('current user:', UserService.user);
            $modalInstance.close($scope.newPromptContent);

            ThoughtSocket.emit('new-prompt', {
                prompt: $scope.newPromptContent,
                userId: UserService.user.id,
                groupId: $routeParams.groupId,
                sessionId: $scope.sessionId
            });

            Logger.createEvent({
                data: 'new prompt from ' + UserService.user.username +
                    'with content: ' + $scope.newPromptContent,
                type: 'newPrompt'
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

})();