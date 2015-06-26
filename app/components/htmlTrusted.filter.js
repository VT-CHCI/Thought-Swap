(function () {
    'use strict';
    
    /**
     * @ngdoc overview
     * @name app
     * @description
     * # The...
     */
    angular.module('app')
        .filter('htmlTrusted', htmlTrusted);
 
    htmlTrusted.$inject = ['$sce'];
    function htmlTrusted($sce) {
        return function(html) {
            return $sce.trustAsHtml(html);
        };
    }
 
})();