(function () {
'use strict';


    angular
        .module('thoughtSwap', [])
        .factory('ThoughtSocket', ThoughtSocket);

    ThoughtSocket.$inject = ['socketFactory'];

    function ThoughtSocket(socketFactory) {
        var myIoSocket = io.connect();

        var ThoughtSocket = socketFactory({
            ioSocket: myIoSocket
        });

        return ThoughtSocket;
    }
})();