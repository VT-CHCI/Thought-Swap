(function () {
    'use strict';
    
    /**
     * @ngdoc overview
     * @name app
     * @description
     * # The...
     */
    angular
        .module('app')
        .directive('focusContenteditable', FocusContentEditable);

    FocusContentEditable.$inject = ['$timeout'];
    function FocusContentEditable($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                console.log('new directive');
                $timeout(function () {
                    console.log($('[contenteditable=true]'));
                    $('[contenteditable=true]').focus();
                });
            }
          };
    }
})();