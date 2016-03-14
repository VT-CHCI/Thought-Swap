'use strict';

/**
 * @author(s): Adam Barnes, Michael Stewart
 * @version: 0.1.0
 */

// Third-Party Dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var Promise = require('bluebird');												// jshint ignore:line
var io = require('socket.io')(http);
var mysql = require('mysql');															// jshint ignore:line
var bodyParser = require('body-parser');
var multer = require('multer'); 
var findMatching = require("bipartite-matching");


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
 *
 */
function bulkCreateParticipants (num, groupId) {
	var createResults = [];
	//console.log("bulkCreateParticipants args: ", num, groupId);
	for (var i = 0; i < num; i++) {
		createResults.push(createParticpant(groupId));
	}
	return Promise.all(createResults)
		.then(function (results) {
			return findGroupById(groupId);
		})
		.catch(function (err) {
			console.error("Err in bulk results: ", err);
		});
}


/**
 *
 */
function initSession (data) {
	// TODO: Use userid to update socketid?
	// console.log('Got into initSession with data', data);
	return new Promise(function (resolve, reject) {
		createSession(data.groupId)
			.then(function (session) {
				return updateGroupSession(data.groupId, session.get('id'))
					.then(function (recordsUpdated) {
						return createPrompt('Awaiting a prompt..', null, data.groupId, session.get('id'))
							.then(function (defaultPrompt) {
								resolve(defaultPrompt);
							})
							.catch(function (error) {
								console.error('Error initSession default prompt.', error);
							});
					});
			})
			.catch(function (error) {
				console.error(">> Error initiating session.", error);
			});
	});
}

function getActiveSession (groupId, socket) {
	// console.log('beginning getActiveSession', groupId);
	return new Promise(function (resolve, reject) {
		findGroupById(groupId)
			.then(function (group) {
				return group.getCurrentSession()
					.then(function (session) {
						if (session === null) {
							initSession({
								groupId: groupId
							})
								.then(function (session) {
									resolve(session);
								});
						} else {
							// console.log(group.getCurrentSession());
							resolve(group.getCurrentSession());
						}
					});
			});

	});
}

//=============================================================================
// Database Communication

function findByUsername (u) {
	// console.log('findByUsername', u);
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
	// console.log('findUserById', i);
	return models.User.findOne({
		where: {
			id: i
		}
	});
}

// function updateUserSocketId(i, s) {
// console.log('updateUserSocketId');
// 	return models.User.update({
// 		currentSocketId: s
// 	},
// 	{
// 		where: {
// 			id: i
// 		}
// 	});
// }

function findAllGroupsByOwner (i) {
	// console.log('findAllGroupsByOwner', i);
	return models.Group.findAll({
		where: {
			ownerId: i
		},
		include: [
			{ model: models.User }
		]
	});
}

function findThoughts (info) {
	// console.log('findThoughts', info);
	return models.Thought.findAll({
		where: {
			promptId: info
		},
		include: [
		{ model: models.User }
		]
	});
	// return new Promise(function (resolve, reject) {
	// 	resolve(info);
	// });
}

function findAllActiveSockets (groupId) {
	// console.log('findAllActiveSockets', groupId);
	return models.Socket.findAll({
		where: {
			active: true,

		},
		include: [
			{
				model: models.User, 
				where: {
					groupId: groupId
				}
			}
		]
	});
}

// function findPromptByAuthorAndSession (i, s) {
// 	// console.log('findPromptByAuthorAndSession', i, s);
// 	return models.Prompt.findOne({
// 		where: {
// 			userId: i,
// 			sessionId: s
// 		},
// 		include: [
// 			{ model: models.Thought }
// 		]
// 	});
// }

function findSessionThoughts(sessionId, userId){
	console.log('findSessionThoughts, sessionId');
	return models.Thought.findAll({
		where: {
			userId: userId,
			
		},
		include: [{
			model: models.Prompt,
			where: {
				sessionId: sessionId
			},
			// order: [['updatedAt', 'DESC']],
		}]
	});
}


function findCurrentPromptForGroup (sessionId) {
	console.log('findCurrentPromptForGroup', sessionId);
	return models.Prompt.findOne({
		order: [['updatedAt', 'DESC']],
		where: {
			sessionId: sessionId
		}, 
		include: [{
			model: models.Thought,
			where: {
				deleted: 0
			}
		}],
	});
}

function findGroupById (i) {
	// console.log('findGroupById', i);
	return models.Group.findOne({
		where: {
			id: i
		},
		include: [
			{ model: models.User },
			{ model: models.Session }
		]
	});
}

function updateGroupSession (g, i) {
	// console.log('updateGroupSession', g, i);
	return models.Group.update({
		CurrentSessionId: i
	},
	{
		where: {
			id: g
		}
	});
}

function createFacilitator (e, u, p) {
	// console.log('createFacilitator', e, u, p);
	return models.User.create({
		email: e,
		username: u,
		password: p,
		role: 'facilitator'
	});
}

function createGroup (n, i) {
	// console.log('createGroup', n, i);
	return models.Group.create({
		name: n,
		ownerId: i
	});
}

function createSession (groupId) {
	// console.log('createSession', groupId);
	return models.Session.create({
		start: new Date(),
		groupId: groupId
	});
}

function createPrompt (c, i, g, s) {
	// console.log('createPrompt');
	return models.Prompt.create({
		content: c,
		userId: i,
		groupId: g,
		sessionId: s
	});
}

function createThought (c, i, p) {
	// console.log('createThought', c, i, p);
	return models.Thought.create({
		content: c,
		userId: i,
		promptId: p
	});
}

function deleteThought (thoughtId) {
	// console.log('deleteThought', thoughtId);
	return models.Thought.update({
			deleted: true
		},
		{
			where: {
				id: thoughtId
			}
		});
}

function endSession (i) {
	// console.log('endSession', i);
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
	// console.log('createParticpant', g);
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

function createSocket(info) {
	// console.log('createSocket', info);
	return models.Socket.create({
			socketioId: info.socketId,
			userId: info.userId,
			active: true
	});
}

function setSocketInactive (socketId) {
	// console.log('setSocketInactive', socketId);
	return models.Socket.update({
		active: false
	}, {
		where: {
			socketioId: socketId
		}
	});
}

// return a promise that tells the caller when all of 
// the rooms have been left
function leaveAllRooms (socket) {
	// console.log('leaveAllRooms', socket);
	return Promise.all(socket.rooms.map(function (room) {
		return socket.leaveAsync(room);
	}));
}

function findSocketByID (socketioId) {
	// console.log('findSocketByID', socketioId);
	return models.Socket.findOne({
		where: {
			socketioId: socketioId
		},
		include: [
			{
				model: models.User,
				include: [{ 
					model: models.Group
				}]
			}
		]
	});
}

function createEvent (info) {
	if (!info.hasOwnProperty('socketid')) {
		info.socketid = 'unknown';
	}
	if (!info.hasOwnProperty('type')) {
		info.type = 'other';
	}
	console.log(['Event Info >>', 
		'\nsocketID: ', info.socketid,
		'\ntype: ', info.type,
		'\ndata: ', info.data, '\n'].join(' '));

	return models.Event.create({
		type: info.type,
		data: info.data,
		socket: info.socketid
	});
}

function createDistribution (data) {
	return models.Distribution.create({
		userId: data.recipient,
		groupId: data.group,
		thoughtId: data.thought
	});
}

function getGroupColors () {
	return models.GroupColor.findAll();
}

function setDistributionColors (options) { //distId, colorId
	return models.Distribution.findById(options.distId)
		.then(function (distribution) {
			distribution.groupColorId = options.colorId;
			return distribution.save();
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
		findByUsername(request.body.user.username)
			.then(function(user) {
				// console.log('Found ', user);
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
		createFacilitator(request.body.user.email,
									 request.body.user.username,
									 request.body.user.password)
			.then(function (user) {
				response.status(201).json({
					user: user
				});
			})
			.catch(function (err) {
				console.error(">> Error in signup: ", err);
				// console.log("Error creating account.", err.errors[0].message);
				response.status(500).json({
					message: "Error creating account: "+ err.errors[0].message[0].toUpperCase() + err.errors[0].message.slice(1),
					error: err
				});
			});
	}
});

app.post('/signout', function(request, response) {
	if (!request.body.hasOwnProperty('user')) {
		response.status(400).send("Request did not contain any information.");
	} else {
		findUserById(request.body.user.id)
			.then(function () {
				//TODO: Log this in the events table
				response.status(200).send("Successfully logged out.");
			})
			.catch(function (err) {
				console.error(">> Error in signout: ", err);
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
				console.error(">> Error in get groups: ", err);
				response.status(500).send("Error finding groups");
			});
	}
});

app.post('/groups/create', function(request, response) {
	if (!request.body.hasOwnProperty('group')) {
		response.status(400).send("Request did not contain any information.");
	} else {
		createGroup(request.body.group.name,
								request.body.group.owner)
			.then(function (group) {
				//TODO: Log this in the events table
				bulkCreateParticipants(request.body.group.numParticipants,
									   group.get('id'))
					.then(function (group) {
						// console.log("Group Created: ", group);
						response.status(200).json({
							group: group
						});
					});
			})
			.catch(function (err) {
				console.error(">> Error in create group: ", err);
				response.status(500).send("Error creating group");
			});
	}
});

// app.delete('/groups/delete', function(request, response) {
//		//TODO: Implement ability to delete groups
// });

//=============================================================================
// Socket Communications

io.on('connection', function(socket) {
	Promise.promisifyAll(socket);
	socket.emit('socket-id', socket.id);
	createEvent({
		type: 'connect',
		data: "Client Connected",
		socketid: socket.id
	});


	socket.on('disconnect', function() {
		createEvent({
			type: 'disconnect',
			data: "Client Disconnected",
			socketid: socket.id
		});
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
	socket.on('facilitator-join', function (data) {
		leaveAllRooms(socket)
			.then(function () {
				return socket.joinAsync('discussion-'+data.groupId);
			})
			.then(function () {
				return socket.joinAsync('facilitator-'+data.groupId);
			})
			.then(function () {
				return getActiveSession(data.groupId, socket);
			})
			.then(function (session) {
				console.log('active session in fac-join');
				console.log(session);
				return findCurrentPromptForGroup(session.get('id'))
					.then(function (defaultPrompt) {
						console.log(defaultPrompt);
						getGroupColors()
							.then(function (colors) {
								socket.emit('group-colors', colors);
							});

						var room = 'discussion-'+data.groupId;
						var message = 'sessionsyncres';
						var messageData = {
							sessionId: session.get('id'),
							prompt: defaultPrompt,
						};

						console.log('about to io.emit', room, message, messageData);

						io.to(room).emit(message, messageData);
					});

					createSocket({
						socketId: socket.id,
						userId: data.userId
					});
			});
	});

	socket.on('facilitator-leave', function (socketId) {
		// console.log('marking inactive', socketId);
		setSocketInactive(socketId);
	});

	/**
	 * Takes facilitator prompt and ensures it appears on all participant views.
	 * 
	 * @param: STRING content - user given prompt to be broadcast to participants
	 */
	socket.on('new-prompt', function (data) {
		createPrompt(data.prompt, data.userId, data.groupId, data.sessionId)
			.then(function (prompt) {
				io.to('discussion-'+data.groupId).emit('facilitator-prompt', prompt);
		});
	});

	// Should: load new session if one does not exist
	// send thoughts to facilitator, prompt to participants, 
	socket.on('session-sync-req', function (data) {
		findGroupById(data.groupId)
			.then(function (group) {
				if(group.get('CurrentSessionId') !== null) {
					// console.log("Recieved request for new session");
					endSession(group.get('CurrentSessionId'));
				}
				initSession({
					groupId: data.groupId
				})
					.then(function (newPrompt) {
						io.to('discussion-'+data.groupId).emit('new-session-prompt', newPrompt);
					});
			})
			.catch(function (error) {
				console.error(">> Error syncing session:", error);
			});
	});

	/**
	 * **CORE FUNCTIONALITY** 
	 * Performs the heavy lifting of shuffling thoughts and handing 
	 * them back to all participant users in the given group
	 * 
	 * @param: INT groupId - The db id of the group whose session needs distribution
	 */
	socket.on('distribute', function (data) {
		//TODO:
		Promise.all([findAllActiveSockets(data.groupId), findThoughts(data.promptId)])
			.then(function (results) {

				// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
				// Returns a random integer between min (included) and max (excluded)
				// Using Math.round() will give you a non-uniform distribution!
				function getRandomInt(min, max) {
				  return Math.floor(Math.random() * (max - min)) + min;
				}

				var activeSockets = shuffle(results[0]);
				var thoughts = shuffle(results[1]);


				var thoughtsLength = thoughts.length;
				var numCopies = activeSockets.length-thoughts.length;
				if (numCopies > 0) {
					for (var i = 0; i < numCopies; i++) {
						thoughts.push(thoughts[getRandomInt(0, thoughtsLength)]);
					}
				}
				// console.log(results);

				// need to make 2 dicts:
				// 1. thought by author id
				// 2. socketid by user id

				var thoughtsAuthors = [];
				thoughts.forEach(function (thought) {
					// console.log(thought);
					thoughtsAuthors.push(thought);
				});

				var presenters = [];
				var socketsByUId = {};

				activeSockets.forEach(function (connectedSocket) {
					// console.log(connectedSocket);
					presenters.push(connectedSocket.get('userId'));
					socketsByUId[connectedSocket.get('userId')] = connectedSocket;
				});

				// console.log(presenters, thoughtsAuthors);
				// via http://stackoverflow.com/a/6274381/3850442
				function shuffle (o) {
			    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
			    return o;
				}

				// TODO: is there a FIXME here? 
				// FIXME: should we do the possibleMatches in a random manner? 
				// right now i think the distribution is fairly regular and people 
				// will probably always get the same other person's thought
				function possibleMatches(thoughtAuthors, thoughtPresenters) {
					var edges = [];
					for (var i=0; i<thoughtAuthors.length; i++) {
						for (var j=0; j<thoughtPresenters.length; j++) {
							// console.log(thoughtAuthors[i], thoughtPresenters[j]);
							if (thoughtAuthors[i].get('userId') !== thoughtPresenters[j]) {
								edges.push([i,j]);
								// console.log([i,j]);
							}
						}
					}
					// console.log('possible matches', edges);
					// shuffle(edges);
					return edges;
				}
				// console.log(possibleMatches(3,4));

				// let m represent the number of connected potential readers, 
				// and let n rep the number of submitted thoughts

				// function thoughtMatcher(m, n) {
				// }

				var potentialMatches = possibleMatches(thoughtsAuthors, presenters);
				console.log(' potential matches', potentialMatches);

				var distribution = findMatching(thoughtsAuthors.length, presenters.length, potentialMatches);
				console.log('distribution', distribution);

				function formatDistribution(distribution) {
					return distribution.map(function (pairing) {
						var authorOfThought = thoughtsAuthors[pairing[0]].get('userId');
						var recipientOfThought = presenters[pairing[1]];
						return recipientOfThought + ' got thought from ' + authorOfThought;
					}).join('\n');
				}

				createEvent({
					socketid: socket.id,
					data: 'groupId: ' + data.groupId + ', ' + 'promptId: ' + data.promptId + '\n' +
						'matches: ' + formatDistribution(distribution),
					type: 'distribution'
				});
				
				distribution.forEach(function (pairing) {
					// console.log('currrent pairing', pairing);
					var thoughtToSendIndex = pairing[0];
					var presenterToReceive = pairing[1];
					var presenterSocketIdx = presenters[presenterToReceive];
					var socketIdOfReceipient = socketsByUId[presenterSocketIdx].get('socketioId');
					var thoughtAuthorForSending = thoughtsAuthors[thoughtToSendIndex];
					var thoughtContent = thoughtAuthorForSending.get('content');

					console.log('current group', thoughtAuthorForSending.get('user').get('groupId'));

					createDistribution({
						recipient: presenterSocketIdx,
						thought: thoughtAuthorForSending.get('id'),
						group: thoughtAuthorForSending.get('user').get('groupId')
					})
						.then(function (newDistribution) {
							console.log('created distribution');
							console.log(newDistribution.get('id'));
							// console.log('io stuff');
							// console.log(io.sockets);
							io.sockets.connected[socketIdOfReceipient].emit('distributed-thought', {id: thoughtAuthorForSending.get('id'), content: thoughtContent, distId: newDistribution.get('id')});
						});

					
				});


			});
		// get the connected people

		// get the current prompt's thoughts

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
		console.log('participant-join', data);

		getGroupColors()
			.then(function (colors) {
				socket.emit('group-colors', colors);
			});

		leaveAllRooms(socket)
			.then(function () {
				return socket.joinAsync('discussion-'+data.groupId);
			})
			.then(function () {
				return socket.joinAsync('participant-'+data.groupId);
			})
			.then(function () {
				getActiveSession(data.groupId, socket)
					.then(function (session) {
						// console.log("Active Session:", session);
							// End last session?


							//get current prompt
							findCurrentPromptForGroup(session.get('id'))
								.then(function (defaultPrompt) {
									var room = 'discussion-'+data.groupId;
									var message = 'sessionsyncres';
									var messageData = {
										sessionId: session.get('id'),
										prompt: defaultPrompt,
									};
									// setTimeout(function () {
										// socket.broadcast.to(room).emit(message, messageData);
										io.to(room).emit(message, messageData);
										io.to('facilitator-'+data.groupId).emit('participant-join');
									// }, 2000);
								});

							findSessionThoughts(session.get('id'), data.userId)
								.then(function(prevThoughts) {
									socket.emit('previous-thoughts', prevThoughts);
								});



						return createSocket({
							socketId: socket.id,
							userId: data.userId
						});
					})
					.catch(function (error) {
						console.error("Error in participant join", error);
					});
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

	socket.on('participant-leave', function (data) {
		// TODO: market Socket Obj inactive
		findSocketByID(data)
			.then(function (socket) {
				if (socket && socket.get('user') && socket.get('user').get('group') && socket.get('user').get('group').get('id')) {
					io.to('facilitator-'+socket.get('user').get('group').get('id')).emit('participant-leave');
				}
			});
		setSocketInactive(data)
	});

	/**
	 * Takes participant thought and ensures it appears on the facilitator's view.
	 * 
	 * @param: STRING content - user-given thought to be broadcast to facilitator
	 */
	socket.on('new-thought', function(newThought) {
		// console.log(newThought);
		createThought(newThought.content, newThought.author.id, newThought.promptId)
			.then(function (thought) {
				socket.broadcast.to('facilitator-' + newThought.author.groupId).emit('participant-thought', thought);
			})
			.catch(function (error) {
				console.error(">> Error on new thought:", error);
			});
	});

	socket.on('choose-group', function(chosenInfo) {
		// chosenInfo has keys: thoughtId, thoughtGroupId, groupId
		// get the groupID for this class
		// then
		console.log('choose-group', chosenInfo);
		if (chosenInfo.hasOwnProperty('thoughtId') &&
			chosenInfo.hasOwnProperty('distId') &&
			chosenInfo.hasOwnProperty('thoughtGroupId') &&
			chosenInfo.hasOwnProperty('groupId') &&
			chosenInfo.hasOwnProperty('presenter')) {
			setDistributionColors ({ //distId, colorId
				distId: chosenInfo.distId,
				colorId: chosenInfo.thoughtGroupId,
			});
			socket.broadcast.to('facilitator-'+chosenInfo.groupId).emit('group-chosen', chosenInfo);
		}
	});

	socket.on('fac-delete-thought', function (data) {
		deleteThought(data.thoughtId);
	});

	socket.on('log', function(info) {
		info.socketid = socket.id;
		createEvent(info);
	});

});
