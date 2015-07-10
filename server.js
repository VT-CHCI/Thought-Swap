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

/**
 * [description]
 * @return Promise<> - db operation to create a default session
 */

// Remnant
// findPromptByAuthorAndSession(data.user.id, session.get('id'))
// 	.then(function (promptsAndThoughts) {
// 		console.log("Recieved prompts and thoughts", promptAndThoughts);
// 		if (promptsAndThoughts.length() === 0) {
			// Default Prompt

// } else {
// 	io.to(data.user.role).emit('session-sync-res', {
// 		sessionId: session.get('id'),
// 		currentPrompt: promptAndThoughts[promptsAndThoughts.length()]
// 										.get('content'),
// 		promptAndThoughts: promptAndThoughts
// 	});
// }
// });

function initSession (groupId) {
	console.log('Got into initSession with groupId)', groupId);
	return createSession()
					.then(function (session) {
						updateGroupSession(groupId, session.get('id'))
							.then(function (prompt) {
								createPrompt('Awaiting a prompt..', null, groupId, session.get('id'))
									.then(function (defaultPrompt) {
										io.to('discussion-'+groupId).emit('session-sync-res', {
											sessionId: session.get('id'),
											currentPrompt: defaultPrompt.get('content'),
										});
									});
							});
					})
					.catch(function (error) {
						console.log(">> Error initiating session.", error);
					});
}

function getActiveSession (groupId) {
	return findGroupById(groupId)
					.then(function (group) {
						console.log("Active session:", group.getCurrentSession());
							if(group.getCurrentSession() === null) {
								return initSession(groupId);
							} else {
								console.log(group.getCurrentSession());
								return  group.getCurrentSession();
							}
					})
}

//=============================================================================
// Database Communication

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

function findUserById (i) {
	return models.User.findOne({
		where: {
			id: i
		}
	});
}

function updateUserSocketId(i, s) {
	return models.User.update({
		currentSocketId: s
	},
	{
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

function findPromptByAuthorAndSession (i, s) {
	return models.Prompt.findOne({
		where: {
			userId: i,
			sessionId: s
		},
		include: [
			{ model: models.Thought }
		]
	});
}

function findGroupById (i) {
	return models.Group.findOne({
		where: {
			id: i
		},
		include: [{ 
				users: models.User,
				session: models.Session
			}
		]
	});
}

function updateGroupSession (g, i) {
	console.log("group update - group, currentSessionId", g, i);
	return models.Group.update({
		currentSessionId: i
	},
	{
		where: {
			id: g
		}
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

function createSession () {
	return models.Session.create({
		start: new Date()
	});
}

function createPrompt (c, i, g, s) {
	return models.Prompt.create({
		content: c,
		userId: i,
		groupId: g,
		sessionId: s
	});
}

function createThought (c, i, s, p) {
	return models.Thought.create({
		content: c,
		userId: i,
		sessionId: s,
		promptId: p
	});
}

function endSession (i) {
	return models.Session.update({
		end: new Date()
	},
	{
		where: {
			id: i
		}
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
				console.log(">> Error in signup: ", err);
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
				console.log(">> Error in signout: ", err);
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
				console.log(">> Error in get groups: ", err);
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
				console.log(">> Error in create group: ", err);
				response.status(500).send("Error creating group");
			});
	}
});

// app.delete('/groups/delete', function(request, response) {

// });

//=============================================================================
// Socket Communications

io.on('connection', function(socket) {
	console.log('** Client Connected.');

	// socket.on('disconnect', function() {
	// 	console.log('** Client Disconnected.');
	// 	//Do DB logging stuff
	// });

	//=====================================================
	// Facilitator Specific Triggers

	/**
	 * Ensures the facilitator user is only in the socket room
	 * they choose and syncs the current session so they can
	 * see thoughts entered before they arrived.
	 * 
	 * @param: INT groupId - The db id of group said facilitator wants to join
	 */
	socket.on('facilitator-join', function (data) {
		socket.rooms.forEach(function (room) {
			socket.leave(room);
		});
		socket.join('discussion-'+data.groupId, function () {
			socket.join('facilitator-'+data.groupId, function () {
				getActiveSession(data.groupId)
					.then(function (session) {
						if (session === null) {
							initSession()
								.then(function () {
									console.log('completed fac-join');
								})
						} else {
							findGroupById(data.groupId)
								.then(function (group) {
									endSession(group.get('CurrentSessionId'))
										.then(function () {

										})

								})
						}
					})
					.catch(function (error) {
						console.log("Error in facilitator join", error);
					});
			}); // TODO: add + groupId
		});	
	});

	/**
	 * Takes facilitator prompt and ensures it appears on all participant views.
	 * 
	 * @param: STRING content - user given prompt to be broadcast to participants
	 */
	socket.on('new-prompt', function (data) {
		// console.log('content of prompt', data);
		createPrompt(data.topic, data.author.id, data.groupId, data.sessionId)
			.then(function (prompt) {
				socket.broadcast.to('participant').emit('facilitator-prompt', prompt);
		});
	});

	// Should: load new session if one does not exist
	//				 send thoughts to facilitator, prompt to participants, 
	// socket.on('session-sync-req', function (data) {
	// 	console.log("Session sync request data:", data);
	// 	findGroupById(data.groupId)
	// 		.then(function (group) {
	// 			if(group.get('currentSessionId') != null) {
	// 				console.log("Recieved request for new session");
	// 				endSession(group.get('currentSessionId'));
	// 				initSession({
	// 					user: data.user,
	// 					groupId: data.groupId
	// 				});
	// 			} else {
	// 				initSession({
	// 					user: data.user,
	// 					groupId: data.groupId
	// 				});
	// 			}
	// 		})
	// 		.catch(function (error) {
	// 			console.log(">> Error syncing session:", error);
	// 		});
	// });

	/**
	 * **CORE FUNCTIONALITY** 
	 * Performs the heavy lifting of shuffling thoughts and handing 
	 * them back to all participant users in the given group
	 * 
	 * @param: INT groupId - The db id of the group whose session needs distribution
	 */
	socket.on('distribute', function (data) {
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
	socket.on('participant-join', function (data) {
		socket.rooms.forEach(function (room) {
			socket.leave(room);
		});
		socket.join('discussion-'+data.groupId, function () {
			socket.join('participant-'+data.groupId, function () {
				getActiveSession(data.groupId)
					.then(function (session) {
						console.log("Active Session:", session);
							// End last session?
					})
					.catch(function (error) {
						console.log("Error in participant join", error);
					});
			}); // TODO: add + groupId
		});
		// updateUserSocketId(data.userId, socket.id)
		// 	.then(function () {
		// 		console.log('   participant joined');
		// 		socket.leave('facilitator');
		// 		socket.join('participant'); // TODO: add + groupId
		// 		findGroupById(data.groupId)
		// 			.then(function (group) {
		// 				if(group.get('currentSessionId') === null) {
		// 					createSession()
		// 				}
		// 			})	
		// 	})
		// 	.catch(function (error) {
		// 		console.log(">> Error on participant join:", error);
		// 	})
	});

	/**
	 * Takes participant thought and ensures it appears on the facilitator's view.
	 * 
	 * @param: STRING content - user-given thought to be broadcast to facilitator
	 */
	socket.on('new-thought', function(newThought) {
		console.log(newThought);
		createThought(data.content, data.author.id, data.sessionId, data.promptId)
			.then(function (thought) {
				socket.broadcast.to('facilitator').emit('participant-thought', thought);
			})
			.then(function (err) {
				console.log(">> Error on new thought:", error);
			})
	});

});
