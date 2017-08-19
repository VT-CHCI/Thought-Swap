(function () {
    'use strict';

    angular
        .module('app')
        .controller('ParticipantController', ParticipantController);

    ParticipantController.$inject = ['$scope', '$location', 'ThoughtSocket',
        'UserService', '$rootScope', 'toastr', 'LoggerService'
    ];

    function ParticipantController($scope, $location, ThoughtSocket,
        UserService, $rootScope, toastr, Logger) {

        (function initController() {
            $scope.htmlThought = ''; // Only needed so that text-angular doesn't complain
            $scope.htmlThoughts = [];
            $scope.distributedThought = '';
            $scope.viewingDistribution = false;
            $scope.dataLoading = false;
            $scope.possibleGroups = [];
            // $scope.selectedGroup = {};
            console.log('about to participant join as', UserService.user.id);
            ThoughtSocket.emit('participant-join', {
                groupId: UserService.user.groupId,
                userId: UserService.user.id
            });
            if ('facilitator' in $location.search()) {
                $scope.attemptedFacilitator = true;
            }

            $rootScope.$on('$routeChangeStart', function () {
                ThoughtSocket.emit('participant-leave');
            });

            $scope.groupSelection = {
                selectedGroupId: ''
            };
            $scope.status = {
                historyIsOpen: false
            };

            $scope.togglePrev = function () {
                $scope.status.historyIsOpen = !$scope.status.historyIsOpen;
            }
            $scope.styleFor = function (item) {
                var itemStyle = {
                    "background-color": item.color,
                    "color": item.text
                };
                // console.log(itemStyle)
                return itemStyle;
            };

            $scope.selectGroupColor = function (item) {
                $scope.groupSelection.selectedGroupId = item.id
            };
        })();

        ThoughtSocket.on('group-colors', function (colors) {
            console.log('group-colors', colors);
            $scope.possibleGroups = colors;
        });

        ThoughtSocket.on('sessionsyncres', function (data) {
            console.log('Received session sync data:', data);
            $scope.prompt = data.prompt;
            $scope.sessionId = data.sessionId;
            // $scope.viewingDistribution = false; // why would this make sense?
            // toastr.info('', 'New Session');
        });

        ThoughtSocket.on('new-session-prompt', function (prompt) {
            console.log('Got data in new-session-prompt', prompt);
            $scope.htmlThoughts = [];
            $scope.prompt = prompt;
            $scope.sessionId = prompt.sessionId;
            $scope.viewingDistribution = false;
        });

        ThoughtSocket.on('previous-thoughts', function (thoughts) {
            console.log('Got prev thoughts', prompt);
            thoughts.forEach(function (thought) {
                $scope.htmlThoughts.push({
                    thought: thought.content
                });
            });
        });

        $scope.setGroup = function () {
            // console.log(something);
            var chooseGroupInfo = {
                thoughtId: $scope.distributedThought.id,
                distId: $scope.distributedThought.distId,
                thoughtGroupId: $scope.groupSelection.selectedGroupId,
                groupId: UserService.user.groupId,
                presenter: UserService.user.id,
            };
            // emit a message to the server that tells it what group this thought belongs to

            ThoughtSocket.emit('choose-group', chooseGroupInfo);
        };

        $scope.$watch('groupSelection.selectedGroupId', function () {
            // console.log(a,b);
            // console.log($scope.groupSelection.selectedGroupId);
            $scope.setGroup($scope.groupSelection.selectedGroupId);
        });

        // @pre - can only submit thought when not viewing a distributed thought
        $scope.submitThought = function () {
            $scope.htmlThoughts.push({
                thought: $scope.htmlThought
            });
            Logger.createEvent({
                data: 'new thought from ' + UserService.user.username + ': ' + $scope.htmlThought,
                type: 'submitThought'
            });
            ThoughtSocket.emit('new-thought', {
                content: $scope.htmlThought,
                author: UserService.user,
                promptId: $scope.prompt.id
            });



            toastr.success('', 'Thought Submitted');
            $scope.htmlThought = null;
            // $('#thoughtForm').focus(); // does not work atm
        };

        ThoughtSocket.on('facilitator-prompt', function (prompt) {
            console.log('got prompt:', prompt);
            $scope.prompt = prompt;
            toastr.info('', 'Recieved New Prompt');
            $scope.viewingDistribution = false;
            // $scope.topic = prompt.content;
        });

        ThoughtSocket.on('distributed-thought', function (thought) {
            toastr.info('', 'Received Thought!');
            console.log('got thought:', thought);
            $scope.distributedThought = thought;
            $scope.viewingDistribution = true;
            // $scope.topic = prompt.content;
        });

        $scope.changedAgree = function (v) { 
            ThoughtSocket.emit('agree', $scope.distributedThought)
        }   
        $scope.changedDisagree = function (v) { 
            ThoughtSocket.emit('disagree', $scope.distributedThought)
        }   

    }

})();