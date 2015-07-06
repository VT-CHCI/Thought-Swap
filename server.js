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
var Promise = require('bluebird');
var bodyParser = require('body-parser');
var multer = require('multer'); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
// Self Dependencies
var models = require('./app.models');

//============================================================================
// Helper Functions

/**
 * Function for creating semi-anonymous participant users
 * List of names credit goes to: http://stackoverflow.com/q/16826200/1449799
 * @return: STRING - sillyname in the form 'firstName lastName1+lastName2'
 */
function makeName() {
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

/**
 * [numSubmitters description]
 * @param: INT groupId - The db id of the group of interest.
 * @return: INT - is number of participants determined to have submitted
 */
function numSubmitters(groupId) {

}

/**
 * 
 */
function findByUsername (u) {
	return models.User.findOne({
		where: {
			username: u
		},
		include: [
			{ model: models.Group, as:'facilitated' }
		]
	});
}

/**
 *
 */
function findUserById (i) {
	return models.User.findOne({
		where: {
			id: i
		}
	});
}

function findAllGroupsByOwner (i) {
	return models.Group.findAll({
		where: {
			ownerId: i
		},
		include: [
			{ model: models.User }
		]
	});
}

function findGroupById (i) {
	return models.Group.findOne({
		where: {
			id: i
		},
		include: [
			{ model: models.User }
		]
	});
}

function createFacilitator (e, u, p) {
	return models.User.create({
		email: e,
		username: u,
		password: p,
		role: 'facilitator'
	});
}

function createGroup (n, i) {
	return models.Group.create({
		name: n,
		owner: i
	});
}

function createParticpant(g) {
	var sillyname = makeName();
	console.log("Creating participant with sillyname: ", sillyname);
	return models.User.create({
		email: null,
		username: sillyname,
		password: null,
		role: 'participant',
		groupId: g
	});
}

function bulkCreateParticipants (num, groupId) {
	var createResults = [];
	console.log("bulkCreateParticipants args: ", num, groupId);
	for (var i = 0; i < num; i++) {
		console.log("got into for loop", i);
		createResults.push(createParticpant(groupId));
	}
	return Promise.all(createResults)
		.then(function (results) {
			return findGroupById(groupId);
		})
		.catch(function (err) {
			console.log("Err in bulk results: ", err);
		})
}

//=============================================================================
// Init Server & Files
app.use(express.static(__dirname + '/app'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

var PORT = 3030;
models.start()
	.then( function () {
		http.listen(PORT, function() {
			console.log('listening on *:', PORT);
		});
	})
	.catch( function (err) {
	    console.error(err);
	});



//=============================================================================
// Routes for non-instant server communications
app.post('/signin', function(request, response) {
	if (!request.body.hasOwnProperty('user')) {
		response.status(400).send("Request did not contain any information.");
	} else {
		// console.log("request body: ", request.body);
		var user = findByUsername(request.body.user.username)
			.then(function(user) {
				// console.log('Searching for ', user);
				if (user !== null) {
					if (user.role === 'facilitator') {
						if (request.body.user.username === user.username &&
							request.body.user.password === user.password) {
							response.status(200).json({
								user: user
							});
						} else {
							// If you get this far, user is not null, so password is wrong
							response.status(401).send("Invalid password.");
						}
					}
					if (user.role === 'participant') {
						if (request.body.user.username === user.username) {
							response.status(200).json({
								user: user
							});
						} else {
							response.status(401).send("Invalid username");
						}
					}
				} else {
					response.status(401).send("Did not find username.");
				}
			});
	}

});

app.post('/signup', function(request, response) {
	if (!request.body.hasOwnProperty('user')) {
		response.status(400).send("Request did not contain any information.");
	} else {
		var user = createFacilitator(request.body.user.email,
									 request.body.user.username,
									 request.body.user.password)
			.then(function (user) {
				// console.log('Created user: ', user);	
				response.status(201).json({
					user: user
				});
			})
			.catch(function (err) {
				console.log("Error in signup: ", err);
				response.status(500).send("Error creating account");
			});
	}

});

app.post('/signout', function(request, response) {
	if (!request.body.hasOwnProperty('user')) {
		response.status(400).send("Request did not contain any information.");
	} else {
		var user = findUserById(request.body.user.id)
			.then(function (user) {
				//TODO: Log this in the events table
				response.status(200).send("Successfully logged out.");
			})
			.catch(function (err) {
				console.log("Error in signout: ", err);
				response.status(500).send("Error logging out");
			});
	}
});

app.get('/groups/:userId', function(request, response) {
	if (!request.params.hasOwnProperty('userId')) {
		response.status(400).send("Request did not contain any information.");
	} else {
		findAllGroupsByOwner(request.params.userId)
			.then(function (groups) {
				// Case of null groups handled client side by requesting user to create group
				response.status(200).json({
					groups: groups
				});
			})
			.catch(function (err) {
				console.log("Error in get groups: ", err);
				response.status(500).send("Error finding groups");
			});
	}
});

app.post('/groups/create', function(request, response) {
	if (!request.body.hasOwnProperty('group')) {
		response.status(400).send("Request did not contain any information.");
	} else {
		var group = createGroup(request.body.group.name,
								request.body.group.owner)
			.then(function (group) {
				//TODO: Log this in the events table
				bulkCreateParticipants(request.body.group.numParticipants,
									   group.dataValues.id)
					.then(function (group) {
						console.log("Group Created: ", group);
						response.status(200).json({
							group: group
						});
					})
			})
			.catch(function (err) {
				console.log("Error in create group: ", err);
				response.status(500).send("Error creating group");
			});
	}
});

// app.delete('/groups/delete', function(request, response) {

// });

//=============================================================================
// Socket Communications
var connectionInfo = {};
io.on('connection', function(socket) {
	console.log('** Client Connected.');

	socket.on('disconnect', function() {
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
	socket.on('facilitator-join', function() {
		console.log('   facilitator joined');
		socket.leave('participant');
		socket.join('facilitator'); // TODO: add + groupId
	});

	/**
	 * Takes facilitator prompt and ensures it appears on all participant views.
	 * 
	 * @param: STRING content - user given prompt to be broadcast to participants
	 */
	socket.on('new-prompt', function(data) {
		// console.log('content of prompt', data);
		models.Prompt.create({
			content: data.topic,
			userId: data.author.id
		}).then(function (prompt) {
			socket.broadcast.to('participant').emit('facilitator-prompt', prompt);
		});
	});

	/**
	 * Resets the given group's session to its initial blank state
	 * All data from previous sessions, if existant should only exist 
	 * in the db after calling.
	 * 
	 * @param: INT groupId - The db id of the group whose session needs reseting.
	 */
	socket.on('new-session', function(groupId) {
		//socket.broadcast.emit('flush-session');
	});

	/**
	 * **CORE FUNCTIONALITY** 
	 * Performs the heavy lifting of shuffling thoughts and handing 
	 * them back to all participant users in the given group
	 * 
	 * @param: INT groupId - The db id of the group whose session needs distribution
	 */
	socket.on('distribute', function(groupId) {
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
	socket.on('participant-join', function() {
		console.log('   participant joined');
		socket.leave('facilitator');
		socket.join('participant'); // TODO: add + groupId
	});

	/**
	 * Takes participant thought and ensures it appears on the facilitator's view.
	 * 
	 * @param: STRING content - user-given thought to be broadcast to facilitator
	 */
	socket.on('new-thought', function(newThought) {
		console.log(newThought);
		models.Thought.create({
			content: newThought.content,
			userId: newThought.author.id
		}).then(function (thought) {
			socket.broadcast.to('facilitator').emit('participant-thought', thought);
		});
	});

});
