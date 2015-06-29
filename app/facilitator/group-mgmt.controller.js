(function () {
    'use strict';
    
    /**
     * @ngdoc overview
     * @name app
     * @description
     * # The register controller is responsible for communicating with the server
     * # to log the new user into the database.
     */
    angular
        .module('app')
        .controller('GroupMgmtController', GroupMgmtController);
 
    GroupMgmtController.$inject = ['$scope'];
    function GroupMgmtController($scope) {
        
    }
 
})();