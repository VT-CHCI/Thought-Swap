'use strict';

/**
 * @author(s): Adam Barnes, Michael Stewart
 * @version: 0.1.0
 */

// Third-Party Dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var RSVP = require('rsvp');
// Self Dependencies
var models = require('./app.models');

//============================================================================
// Helper Functions

/**
 * Function for creating semi-anonymous participant users
 * List of names credit goes to: http://stackoverflow.com/q/16826200/1449799
 * @return: STRING - sillyname in the form 'firstName lastName1+lastName2'
 */
function makeName () {
    var firstName = ['Runny', 'Buttercup', 'Dinky', 'Stinky', 'Crusty', 'Greasy',
        'Gidget', 'Cheesypoof', 'Lumpy', 'Wacky', 'Tiny', 'Flunky', 'Fluffy',
        'Lulu', 'Zippy', 'Doofus', 'Gobsmacked', 'Slimy', 'Grimy', 'Salamander',
        'Oily', 'Burrito', 'Bumpy', 'Loopy', 'Snotty', 'Irving', 'Egbert', 'Waffer',
        'Star', 'Lilly', 'Rugrat', 'Fuzzy', 'Kitty', 'Puppy', 'Snuggles', 'Angel',
        'Rubber', 'Stinky', 'Lala', 'Sparkle', 'Glitter', 'Silver', 'Golden', 
        'Rainbow', 'Cloud', 'Rain', 'Stormy', 'Wink', 'Sugar', 'Twinkle', 'Halo'
    ];

    // var middleName =['Waffer', 'Lilly','Rugrat','Sand', 'Fuzzy','Kitty',
    //  'Puppy', 'Snuggles','Rubber', 'Stinky', 'Lulu', 'Lala', 'Sparkle', 
    //  'Glitter', 'Silver', 'Golden', 'Rainbow', 'Cloud', 'Rain', 'Stormy',
    //  'Wink', 'Sugar', 'Twinkle', 'Star', 'Halo', 'Angel'];

    var lastName1 = ['Snicker', 'Buffalo', 'Gross', 'Bubble', 'Sheep', 'Sand',
        'Corset', 'Toilet', 'Lizard', 'Waffle', 'Kumquat', 'Burger', 'Chimp',
        'Liver', 'Gorilla', 'Rhino', 'Emu', 'Pizza', 'Toad', 'Gerbil', 'Pickle',
        'Tofu', 'Chicken', 'Potato', 'Hamster', 'Lemur', 'Vermin'
    ];

    var lastName2 = ['face', 'dip', 'nose', 'brain', 'head', 'breath',
        'pants', 'shorts', 'lips', 'mouth', 'muffin', 'butt', 'bottom', 'elbow',
        'honker', 'toes', 'buns', 'spew', 'kisser', 'fanny', 'squirt', 'chunks',
        'brains', 'wit', 'juice', 'shower'
    ];

    function getRandomInt (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // return [
    //     firstName[getRandomInt(0, firstName.length)],
    //     // middleName[getRandomInt(0, middleName.length)],
    //     lastName1[getRandomInt(0, lastName1.length)],
    //     lastName2[getRandomInt(0, lastName2.length)]
    // ];

    return firstName[getRandomInt(0, firstName.length)] + ' ' +
        lastName1[getRandomInt(0, lastName1.length)] +
        lastName2[getRandomInt(0, lastName2.length)];
}

/**
 * [numSubmitters description]
 * @param: INT groupId - The db id of the group of interest.
 * @return: INT - is number of participants determined to have submitted
 */
function numSubmitters (groupId) {
    
}

/**
 * 
 */
function findByUsername (u) {
    return User.findOne({
            where: {
                username: u;
           }
    });
}

function createFacilitator (e, u, p) {
    return User.create({
        where: {
          email: e,
          username: u,
          password: p,
          role: 'facilitator'
        }
    });
}

function createParticpant () {
    var sillyname = makeName();
    return User.create({
        where: {
          email: null,
          username: sillyname,
          password: null,
          role: 'participant'
        }
    });
}


//=============================================================================
// Init Server
app.use(express.static(__dirname + '/app'));

var PORT = 3030;
models.start();
    // .then( function () {
        http.listen(PORT, function() {
        console.log('listening on *:', PORT);
        });
    // })
    // .catch( function (err) {
    //     console.error(err);
    // });



//=============================================================================
// Routes for non-instant server communications
app.post('/signin', function (request, response) {
    if (!req.body.hasOwnProperty('user')) {
        response.status(400).send("Request did not contain any information.")
    }
    else {
        var user = findByUsername(request.user.username);
        .then (user) {
            console.log('Searching for ', user.username);

            if (user !== null) {
                if (user.role === 'facilitator') {
                    if (request.user.username === user.username && 
                        request.user.password === user.password) {
                            response.status(200).json({ name: user.username, 
                                                        auth: true });
                    }
                    else {
                        response.send("Invalid username or password.");
                    }
                }
                if (user.role === 'participant') { 
                    if (request.user.username === user.username) {
                        response.status(200).json({ name: user.username, 
                                                    auth: true });
                    }
                    else {
                        response.send("Invalid username");
                    }
                }
            }
            else {
                response.send("Did not find username.");   
            }
        }
    }
    
});

app.get('/signup', function (req, res) {
    if (!req.body.hasOwnProperty('user')) {
        response.status(400).send("Request did not contain any information.")
    }
    else {
        var user = createFacilitator(request.user.email
                                     request.user.username
                                     request.user.password);
        .then (user) {
            console.log('Searching for ', user.username);

            if (user !== null) {
                if (user.role === 'facilitator') {
                    if (request.user.username === user.username && 
                        request.user.password === user.password) {
                            response.status(200).json({ name: user.username, 
                                                        auth: true });
                    }
                    else {
                        response.send("Invalid username or password.");
                    }
                }
                if (user.role === 'participant') { 
                    if (request.user.username === user.username) {
                        response.status(200).json({ name: user.username, 
                                                    auth: true });
                    }
                    else {
                        response.send("Invalid username");
                    }
                }
            }
            else {
                response.send("Did not find username.");   
            }
        }
    }
});

app.get('/signout', function (req, res) {
    
});

app.get('/groups', function (req, res) {

});

//=============================================================================
// Socket Communications
var connectionInfo = {};
io.on('connection', function (socket) {
    console.log('** Client Connected.');

    socket.on('disconnect', function () {
        console.log('** Client Disconnected.');
        //Do DB logging stuff
    });

    //=====================================================
    // Facilitator Specific Triggers

    /**
     * Ensures the facilitator user is only in the socket room
     * they choose and syncs the current session so they can
     * see thoughts entered before they arrived.
     * 
     * @param: INT groupId - The db id of group said facilitator wants to join
     */
    socket.on('facilitator-join', function () {
        console.log('   facilitator joined');
        socket.leave('participant');
        socket.join('facilitator'); // TODO: add + groupId
    });

    /**
     * Takes facilitator prompt and ensures it appears on all participant views.
     * 
     * @param: STRING content - user given prompt to be broadcast to participants
     */
    socket.on('new-prompt', function (content) {
        socket.broadcast.to('participant').emit('facilitator-prompt', content);
    });

    /**
     * Resets the given group's session to its initial blank state
     * All data from previous sessions, if existant should only exist 
     * in the db after calling.
     * 
     * @param: INT groupId - The db id of the group whose session needs reseting.
     */
    socket.on('new-session', function (groupId) {
        socket.broadcast.emit('flush-session');
    });

    /**
     * Sets up the new group by entering the provided data into the db,
     * creates the participant users, and then sends that data back to the client
     * 
     * @param: STRING groupName - User-given name to be associated with group in db
     * @param: INT numParticipants - Amount of participants assigned to group
     */
    socket.on('new-group', function (groupName, numParticipants) {
        //TODO: 
    });
    
    /**
     * **CORE FUNCTIONALITY** 
     * Performs the heavy lifting of shuffling thoughts and handing 
     * them back to all participant users in the given group
     * 
     * @param: INT groupId - The db id of the group whose session needs distribution
     */
    socket.on('distribute', function (groupId) {
        //TODO:
    });

    //=====================================================
    // Participant Specific Triggers
    
    /**
     * Ensures the participant user is only in the socket room
     * they belong to and syncs the current session with users
     * who join after the session begins.
     * 
     * @param: INT groupId - The db id of the group said participant belongs to
     */
    socket.on('participant-join', function () {
        console.log('   participant joined');
        socket.leave('facilitator');
        socket.join('participant'); // TODO: add + groupId
    });

    /**
     * Takes participant thought and ensures it appears on the facilitator's view.
     * 
     * @param: STRING content - user-given thought to be broadcast to facilitator
     */
    socket.on('new-thought', function (content) {
        socket.broadcast.to('facilitator').emit('participant-thought', content);
    });

});