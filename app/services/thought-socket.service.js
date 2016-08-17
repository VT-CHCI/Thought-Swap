(function () {
    'use strict';

    /**
     * @ngdoc overview
     * @name ThoughtSocket
     * @description
     * # The primary service of the ThoughtSwap app allows the
     * # various controllers to communicate with the server's socket
     */
    angular
        .module('thoughtSwap', [])
        .factory('ThoughtSocket', ThoughtSocket);

    ThoughtSocket.$inject = ['socketFactory'];
    function ThoughtSocket(socketFactory) {
        var myIoSocket = io.connect('/');

        var ThoughtSocket = socketFactory({
          ioSocket: myIoSocket
        });

        return ThoughtSocket;
    }
})();