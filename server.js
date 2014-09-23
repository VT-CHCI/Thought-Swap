var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var async = require('async');
var mysql = require('mysql');

// MySQL database initialization
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'thoughtswap',
    password: 'thoughtswap',
    database: 'thoughtswap'
});

connection.connect();

//-------------------------------------------------------------------------
/**
 *  The server file for the ThoughtSwap app, handles client interaction
 *  and provides functionality on the back-end that controllers alone
 *  are insufficient for. Also handles all data logging required for
 *  user research.
 *
 *  @authors Michael Stewart, Adam Barnes
 *  @version v 1.0.0  (2014)
 */
//-------------------------------------------------------------------------



/**
 * INCLUDE SILLYNAMES: Got the lists for this from
 * http://stackoverflow.com/q/16826200/1449799
 */
function makeName() {
    var firstName = ["Runny", "Buttercup", "Dinky", "Stinky", "Crusty",
        "Greasy", "Gidget", "Cheesypoof", "Lumpy", "Wacky", "Tiny", "Flunky",
        "Fluffy", "Zippy", "Doofus", "Gobsmacked", "Slimy", "Grimy", "Salamander",
        "Oily", "Burrito", "Bumpy", "Loopy", "Snotty", "Irving", "Egbert", "Waffer", "Lilly", "Rugrat", "Sand", "Fuzzy", "Kitty",
        "Puppy", "Snuggles", "Rubber", "Stinky", "Lulu", "Lala", "Sparkle", "Glitter",
        "Silver", "Golden", "Rainbow", "Cloud", "Rain", "Stormy", "Wink", "Sugar",
        "Twinkle", "Star", "Halo", "Angel"
    ];

    // var middleName =["Waffer", "Lilly","Rugrat","Sand", "Fuzzy","Kitty",
    //  "Puppy", "Snuggles","Rubber", "Stinky", "Lulu", "Lala", "Sparkle", "Glitter",
    //  "Silver", "Golden", "Rainbow", "Cloud", "Rain", "Stormy", "Wink", "Sugar",
    //  "Twinkle", "Star", "Halo", "Angel"];

    var lastName1 = ["Snicker", "Buffalo", "Gross", "Bubble", "Sheep",
        "Corset", "Toilet", "Lizard", "Waffle", "Kumquat", "Burger", "Chimp", "Liver",
        "Gorilla", "Rhino", "Emu", "Pizza", "Toad", "Gerbil", "Pickle", "Tofu",
        "Chicken", "Potato", "Hamster", "Lemur", "Vermin"
    ];

    var lastName2 = ["face", "dip", "nose", "brain", "head", "breath",
        "pants", "shorts", "lips", "mouth", "muffin", "butt", "bottom", "elbow",
        "honker", "toes", "buns", "spew", "kisser", "fanny", "squirt", "chunks",
        "brains", "wit", "juice", "shower"
    ];

    function getRandomInt(min, max) {
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
//-------------------------------------------------------------------------

/**
 * ~~ Initialization ~~
 * Steps required to start up the app and provide future functions with
 * variables they will use.
 */
app.use(express.static(__dirname + '/app'));

var port = 3003;
http.listen(port, function() {
    console.log('listening on *:', port);
});

var allThoughts = {}; // allThoughts = socketid: 
// [{ id: socket.id, thought: thought1, databaseId: insertId}, 
//  { id: socket.id, thought: thought2, databaseId: insertId}, ...]

var chronologicalThoughts = {}; // list of thoughts for the teacher view as they are recieved
var newQuestion = '';
var currentPromptId = -1;
var role_ids = {
    teacher: 1,
    student: 2
};

/**
 * Will return the number of unique ids in allThoughts which correlates
 * to the amount of submitters.
 */
function numSubmitters(groupId) {
    if (!allThoughts.hasOwnProperty(groupId)) {
        allThoughts[groupId] = {};
    }
    return Object.keys(allThoughts[groupId]).length;
}

/**
 * Will add the thoughts recieved to an array that is sent to the
 * teacher's view.
 */
function addThought(socket, thought, id, groupId) {
    // console.log('addthought:', socket, thought, id);
    console.log('addthought:', thought);
    if (!allThoughts.hasOwnProperty(groupId)) {
        allThoughts[groupId] = {};
    }
    if (!chronologicalThoughts.hasOwnProperty(groupId)) {
        chronologicalThoughts[groupId] = [];
    }
    var newThought = {
        id: socket.id,
        thought: thought,
        databaseId: id
    };
    //console.log(newThought);
    chronologicalThoughts[groupId].push(newThought);
    if (allThoughts[groupId].hasOwnProperty(socket.id)) {
        allThoughts[groupId][socket.id].push(newThought);
    } else {
        //this means we just got a new submitter
        allThoughts[groupId][socket.id] = [newThought];
        socket.broadcast.to('teacher/'+connectionInfo[socket.id].currentGroupId).emit('num-submitters', numSubmitters(groupId));
    }
}

function generateAddStudentFunctions(n, classId) {
    var tasklist = [];
    for (var i = 0; i < n; i++) {
        tasklist.push(function(callback) {
            addStudent(classId, callback);
        });
    }
    return tasklist;
}

function addStudent(classId, callback) {
    var name = makeName();
    var searchName = 'select * from users where name=?';
    connection.query(searchName, [name], function(error, results) {
        if (error) {
            callback(error);
            return;
        }
        // console.log('addStudent results');
        // console.log(results);
        if (results.length > 0) {
            addStudent(classId, callback);
        } else {
            var addStudent = 'insert into users (name) values (?)';
            connection.query(addStudent, [name], function(error, results) {
                if (error) {
                    callback(error);
                    return;
                }
                var userId = results.insertId;
                var membershipQuery = 'insert into thoughtswap_role_memberships (user_id, role_id, group_id) values (?, ?, ?)';
                connection.query(membershipQuery, [userId, 2, classId], function(error, results) {
                    // console.log("Added user " + userId + " to class " + classId);
                    // console.log('membershipQuery results', results);
                    if (error) {
                        console.log('callback error', error);
                        callback(error);
                    }

                    callback(null, {
                        id: results.insertId,
                        name: name
                    });
                });
            });
        }
    });
    return {
        username: name
    };
}

function getClientId(socketId, callback) {
    var selectClient_id = 'select id from thoughtswap_clients where socket_id=?;'
    connection.query(selectClient_id, [socketId], function(err, results) {
        //console.log('getClientId', err, results);
        if (results.length > 0) {
            callback(results[0].id);
        }
    });
}

// function getNames(count, classId, teacherId) {
//     var names = [];
//     for (var i = 0; i < count; i++) {
//         names[i] = addStudent(classId);
//     }
//     return names;
// }

function getClasses(connectionInfo, socket) {
    // console.log(connectionInfo.teacherId);
    var detailsQuery = 'SELECT g.name as "name", others.name as "username", others.id as "uid", g.id as "group_id" ' +
        'from thoughtswap_groups g ' +
        'JOIN thoughtswap_role_memberships m on m.group_id=g.id and m.role_id=2 ' +
        'JOIN users others on others.id = m.user_id ' +
        'WHERE g.owner=? order by g.id;';
    connection.query(detailsQuery, [connectionInfo.teacherId], function(error, results) {
        if (error) {
            console.log('getClasses error', error);
        }
        console.log('getClasses results', results);

        socket.emit('load-classes', results);
    });
}

//-------------------------------------------------------------------------

/**
 * ~~ Activity ~~
 * The main functions of the server, listening for events on the client
 * side and responding appropriately.
 */
var connectionInfo = {};
io.sockets.on('connection', function(socket) {
    console.log('>> Client Connected  >> ');

    /**
     * Database Query: Will log relevant data in the socket_id, and
     * connect columns for the CLIENTS table
     */
    var clientQuery = 'insert into thoughtswap_clients(socket_id, connect) values(?, ?);'
    connection.query(clientQuery, [socket.id, new Date()], function(err, results) {
        //console.log('connect', err, results);
        if (results.hasOwnProperty('insertId')) {
            connectionInfo[socket.id] = {};
            connectionInfo[socket.id]['client_id'] = results.insertId;
        }
    });

    /**
     * Will catch when a client leaves the app interface entirely and send
     * out the updated number of connected students for the teacher view.
     */
    socket.on('disconnect', function() {
        console.log('<< Client Disconnected << ');

        /**
         * Database Query: Will log relevant data in the disconnect
         * column for the CLIENTS table
         */
        // getClientId(socket.id, function (clientId) {
            if (connectionInfo.hasOwnProperty(socket.id)&& connectionInfo[socket.id].hasOwnProperty('client_id')) {
                var clientQuery = 'update thoughtswap_clients set disconnect=? where id=?;'
                connection.query(clientQuery, [new Date(), connectionInfo[socket.id].client_id], function(err, results) {
                    //console.log('client disconnect updated', err, results);
                });
            }
        // });

        if (io.nsps['/'].adapter.rooms.hasOwnProperty('student')) {

            var numStudents = 0;
            if (connectionInfo.hasOwnProperty(socket.id) && 
                connectionInfo[socket.id].hasOwnProperty('currentGroupId') &&
                io.nsps['/'].adapter.rooms.hasOwnProperty('student/'+connectionInfo[socket.id].currentGroupId)) {
                    numStudents = Object.keys(io.nsps['/'].adapter.rooms['student/'+connectionInfo[socket.id].currentGroupId]).length;
            }
            socket.broadcast.to('teacher/'+connectionInfo[socket.id].currentGroupId).emit('num-students', numStudents);
        }

    });

    /**
     * Will catch when a student submits a thought and send that info
     * to teachers
     */
    socket.on('new-thought-from-student', function(newThought) {

        /**
         * Database Query: Will log relevant data in the content, client_id,    ***Still need to add group_id support***
         * prompt_id, columns to the THOUGHTS table
         */
        // getClientId(socket.id, function (clientId) {
        var queryParams = [newThought, new Date(), connectionInfo[socket.id].client_id, connectionInfo[socket.id].currentGroupId];
        var thoughtQuery = 'insert into thoughtswap_thoughts(content, recieved, author_id, group_id) values(?, ?, ?, ?);'
        if (currentPromptId != -1) {
            thoughtQuery = 'insert into thoughtswap_thoughts(content, recieved, author_id, group_id, prompt_id) values(?, ?, ?, ?, ?);'
            queryParams.push(currentPromptId);
        }
        console.log(thoughtQuery);
        console.log('new-thought-from-student queryParams:', queryParams);
        connection.query(thoughtQuery, queryParams, function(err, results) {
            //console.log('new thought logged', err, results);
            if (err) {
                console.log(err);
            }
            else {
                addThought(socket, newThought, results.insertId, connectionInfo[socket.id].currentGroupId);
            }

        });
        // });

        //console.log('New Thought');

        socket.broadcast.to('teacher/'+connectionInfo[socket.id].currentGroupId).emit('new-thought-from-student', newThought);
    });


    /**
     * Will listen for a prompt from teachers and send it along to students.
     */
    socket.on('new-prompt', function(newPrompt) {

        /**
         * Database Query: Will log relevant data in the content and recieved
         * columns of the PROMPTS table
         */
        console.log('from new-prompt:', connectionInfo[socket.id]);
        var promptQuery = 'insert into thoughtswap_prompts(content, recieved, author_id, group_id) values(?, ?, ?, ?)';
        connection.query(promptQuery, [newPrompt, new Date(), connectionInfo[socket.id].client_id, connectionInfo[socket.id].currentGroupId], function(err, results) {
            //console.log('prompt logged', err, results);
            if (err) {
                console.log('error in new-prompt', err);
            }
            else {
                currentPromptId = results.insertId;
            }

        });

        // console.log('Prompt recieved');
        socket.broadcast.to('student/'+connectionInfo[socket.id].currentGroupId).emit('new-prompt', newPrompt);
        newQuestion = newPrompt;
    });

    /**
     * Will catch when a teacher initiates a new session and set server
     * variables back to their initial state.
     */
    socket.on('new-session', function(groupId) {
        // console.log('new session initiated');
        socket.broadcast.emit('new-session');
        allThoughts[groupId] = {};
        chronologicalThoughts[groupId] = [];
        newQuestion = '';
    })

    /**
     * Will catch when a teacher connects, then add them to the teacher
     * room after ensuring they are not in the student room, then update
     * counts accordingly. It will also sync available data for
     * teachers who may have joined after a session has begun.
     */
    socket.on('teacher', function(groupToJoin) {
        // console.log('Teacher Joined')
        socket.leave('student');
        socket.join('teacher/' + groupToJoin);
        connectionInfo[socket.id].currentGroupId = groupToJoin;
        console.log(groupToJoin);
        var conn = 0;
        console.log("attempt to log socket io info in 'teacher'");
        console.log(io.nsps['/'].adapter.rooms);
        console.log(Object.keys(io.nsps['/'].adapter.rooms));

        if (io.nsps['/'].adapter.rooms.hasOwnProperty('student/' + groupToJoin)) {
            conn = Object.keys(io.nsps['/'].adapter.rooms['student/' + groupToJoin]).length;
        }
        var thoughtsForSync = [];
        if (chronologicalThoughts.hasOwnProperty(groupToJoin)) {
            thoughtsForSync = chronologicalThoughts[groupToJoin];
        }
        socket.emit('thought-sync', {
            thoughts: thoughtsForSync,
            connected: conn,
            submitters: numSubmitters(groupToJoin)
        });

        socket.broadcast.to('teacher/'+connectionInfo[socket.id].currentGroupId).emit('num-students', conn);
    });

    /**
     * Will catch when a student connects, then add them to the student
     * room after ensuring they are not in the teacher room, then update
     * counts accordingly.
     */
    socket.on('student', function(groupToJoin) {
        socket.leave('teacher');
        connectionInfo[socket.id].currentGroupId = groupToJoin;
        socket.join('student/' + groupToJoin); // + groupId

        io.sockets.emit('prompt-sync', newQuestion); // Just this channel

        socket.broadcast.to('teacher/'+connectionInfo[socket.id].currentGroupId).emit('num-students',
            Object.keys(io.nsps['/'].adapter.rooms['student/' + groupToJoin]).length);
    });

    //-------------------------------------------------------------------------
    /**
     * ~~ Primary Feature ~~
     * Will catch when a teacher chooses to distribute the thoughts
     * they have recieved. Performs the work nessessary to implement
     * distribution to each student.
     */
    socket.on('distribute', function() {
        console.log('got distribute msg');

        // Unique IDS of all students that thoughts need to be distributed to
        var recipients = Object.keys(io.nsps['/'].adapter.rooms['student/'+connectionInfo[socket.id].currentGroupId]);

        // if (recipients >= 2) {
        //   socket.broadcast.emit('enough-submitters');
        // }

        // console.log('enough submitters present, distributing...');

        // Placeholder variable for the distribute operation
        var flatThoughts = [];
        var studentSubmitters = Object.keys(allThoughts[connectionInfo[socket.id].currentGroupId]);

        for (var i = 0; i < studentSubmitters.length; i++) {
            flatThoughts = flatThoughts.concat(allThoughts[connectionInfo[socket.id].currentGroupId][studentSubmitters[i]])
        }

        var originalFlatThoughts = flatThoughts.slice();

        /**
         * Shuffle algorithm for randomizing an array.
         */
        function shuffle(o) { //v1.0 courtesy of Google
            for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        };

        /**
         * Will ensure that the ammount of thoughts up for distribution is the
         * same as the number of possible recipients.
         */
        if (recipients.length > originalFlatThoughts.length) {
            console.log('Thoughts will be fixed');
            var diff = recipients.length - originalFlatThoughts.length;
            for (var i = 0; i < diff; i++) {
                flatThoughts.push(originalFlatThoughts[Math.floor((Math.random() * originalFlatThoughts.length))]);
            }
        }

        console.log('Preparing to shuffle');

        var shuffledFlatThoughts = flatThoughts.slice();
        shuffle(shuffledFlatThoughts);

        /**
         * Will loop through two arrays, returning true if a match
         * between them is found, false if no matches exists.
         */
        function hasMatch(a, b) {
            for (var i = 0; i < a.length; i++) {
                if (a[i].id == b[i]) {
                    return true;
                };
            };
            return false;
        };

        /**
         * Will take the shuffled arrays and reshuffle if nessessary
         * to ensure no student recieves the same thought they submitted.
         */
        while (hasMatch(shuffledFlatThoughts, recipients)) {
            shuffle(shuffledFlatThoughts);
        }

        console.log('reshuffling complete', shuffledFlatThoughts);


        /**
         * Will methodically send each student their newly assigned
         * thought, traveling through the old distribution until completion.
         */
        //console.log(shuffledFlatThoughts);
        for (var i = 0; i < recipients.length; i++) {
            //console.log(shuffledFlatThoughts[i]);

            /**
             * Database Query: Will log relevant data in the thought_id, and
             * reader_id, columns to the DISTRIBUTIONS table
             */
            function getCallback(j) { //read about closures and evaluation and scope in javascript (maybe in michael's programming languages book)
                return function(clientId) {
                    //console.log(j);
                    var distributeQuery =
                        'insert into thoughtswap_distributions(thought_id, reader_id, distributedAt) values(?, ?, ?);'

                    connection.query(distributeQuery, [shuffledFlatThoughts[j].databaseId, clientId, new Date()],
                        function(err, results) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log(results);
                            }
                            //console.log('distributions table filled in', err, results);
                        });
                }
            }

            getClientId(recipients[i], getCallback(i));

            console.log(recipients[i], shuffledFlatThoughts[i]);
            socket.to(recipients[i]).emit('new-distribution',
                shuffledFlatThoughts[i].thought);
        }

        // console.log('completed sending messages');
        // console.log('flatThoughts', flatThoughts);
        // console.log('recipients', recipients);
        // console.log('shuffledFlatThoughts', shuffledFlatThoughts);
    });

    //-------------------------------------------------------------------------
    /**
     * ~~ USER SERVICE ~~
     * Will handle the registration process for new users.
     */
    function getUserInfo(teacherDbId, userInfoCallback) {
        var ownedGroups = "select * from thoughtswap_groups where owner=?"; //teacherDbId
        connection.query(ownedGroups, [teacherDbId], function(ownedError, ownedResults) {
            if (ownedError) {
                console.log(ownedError);
            } else {
                var teacherPermissions = "select * from thoughtswap_role_memberships where user_id=?" //teacherDbId
                connection.query(teacherPermissions, [teacherDbId], function(permissionsError, permissionsResults) {
                    if (permissionsError) {
                        console.log(permissionsError);
                    } else {
                        userInfoCallback({
                            permissions: permissionsResults,
                            groups: ownedResults
                        });
                    }
                });
            }
        });
        userInfoCallback(null);
    }

    socket.on('new-registration', function(registrationData) {
        console.log("New User: ", registrationData);
        var usernames = 'select * from users where name=?';
        connection.query(usernames, [registrationData.user], function(error, results) {
            if (error) {
                console.log(error);
            } else {
                if (results.length > 0) {
                    var message = "Username already exists";
                    console.log(message);
                    socket.emit('registration-failed', message);
                } else if (registrationData.email == null || registrationData.email.length == 0) {
                    message = "invalid email"
                    console.log(message);
                    socket.emit('registration-failed', message);
                } else {
                    var newUser = 'insert into users (name, password, email) values (?, ?, ?)';
                    connection.query(newUser, [registrationData.user, registrationData.pass, registrationData.email], function(error, results) {
                        if (error) {
                            console.log(error);
                        }
                        console.log(results);
                        var teacherDbId = results.insertId;
                        connectionInfo[socket.id]['teacherId'] = teacherDbId;
                        socket.emit('teacher-logged-in', {
                            uid: teacherDbId,
                            username: registrationData.username,
                            teacher: true
                        });
                    });
                }
            }
        });
    });

    /**
     * Will handle the login process for returning users and student sillynames
     */
    socket.on('teacher-login-attempt', function(authenticationInfo) {
        console.log('Searching for ', authenticationInfo.username);

        var returningUser = 'select * from users where name=?';
        connection.query(returningUser, [authenticationInfo.username], function(error, results) {
            if (error) {
                console.log(error);
            }
            console.log(results);
            if (authenticationInfo.username == results[0].name && authenticationInfo.password == results[0].password) {
                console.log(results, "User match, Line on login-teacher-attempt");
                connectionInfo[socket.id]['teacherId'] = results[0].id;
                console.log('from teacher login:', connectionInfo[socket.id]);

                socket.emit('teacher-logged-in', {
                    uid: connectionInfo[socket.id].teacherId,
                    username: authenticationInfo.username,
                    teacher: true
                });

                console.log('Teacher Logged In Status is nominal');
                getClasses(connectionInfo[socket.id], socket);
            } else {
                console.log('teacher login failed');
                socket.emit('login-failed', error);
            }
        });
    });

    socket.on('student-login-attempt', function(sillyname) {
        console.log('Searching for ', sillyname);
        // assume student in onlyt 1 class
        var returningUser = 'SELECT u.*, g.id as "group_id", g.name as "group_name"' +
        ' FROM users u JOIN thoughtswap_role_memberships m on m.user_id=u.id' +
        ' JOIN thoughtswap_groups g on g.id=m.group_id where u.name=?';
        connection.query(returningUser, [sillyname], function(error, results) {
            if (error) {
                console.log(error);
                socket.emit('login-failed', error);
            }
            else {

                console.log(results);

            //var studentInfo = {};
            
            //var groups=[];
            //Accounting for student could be in multiple groups/ classes
            // for (var i=0; i<results.length;i++) {
            //     var studentDbId = results[i].id;
            //     var groupId = results[i].group_id;
            //     var groupName = results[i].group_name;
            //     groups.push( {
            //         userId: studentDbId,
            //         username: sillyname,
            //         groupId: groups,
            //         groupName: groupName
            //     });
            // }

                console.log("User match");

                socket.emit('student-logged-in', {
                    userId: results[0].id,
                    username: sillyname,
                    groupId: results[0].group_id,
                    groupName: results[0].group_name
                });
                console.log('Student Status is logged in');
            }
        });
    });

    socket.on('create-class', function(class_name, number) {
        console.log('class_name : ', class_name);
        console.log('number : ', number);
        var newClassQuery = 'insert into thoughtswap_groups(name, owner) values (?, ?)';
        console.log('connectionInfo[socket.id].teacherId');
        console.log(connectionInfo[socket.id].teacherId);
        connection.query(newClassQuery, [class_name, connectionInfo[socket.id].teacherId], function(error, results) {
            console.log('error');
            console.log(error);
            console.log('results');
            console.log(results);

            var groupId = results.insertId;

            var teacherRole = 'insert into thoughtswap_role_memberships (user_id, role_id, group_id) values (?, ?, ?)';
            connection.query(teacherRole, [connectionInfo[socket.id].teacherId, 1, groupId], function(error, results) {
                console.log('error');
                console.log(error);
                console.log('results');
                console.log(results);
            });

            async.parallel(generateAddStudentFunctions(number, groupId), function(error, results) {
                if (error) {
                    console.log('error adding students in create-class', error);
                }
                console.log('async results', results);
                var studentList = results;
                socket.emit('class-created', class_name, number, groupId, studentList);
            });

            //return the names list that goes with this class
            // getClasses(connectionInfo[socket.id], socket);
        });
    });

});
