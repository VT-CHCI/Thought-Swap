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
        .module('app')
        .factory('ThoughtSocket', ThoughtSocket);

    ThoughtSocket.$inject = ['socketFactory'];
    function ThoughtSocket(socketFactory) {
        var myIoSocket = io.connect('http://localhost:3030');

        var ThoughtSocket = socketFactory({
          ioSocket: myIoSocket
        });

        return ThoughtSocket;

})();