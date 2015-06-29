var RSVP = require('rsvp');
var Sequelize = require('sequelize');
sequelize = new Sequelize('thoughtswap', // database name
													'thoughtswap', // username
													'thoughtswap', // password
	{ logging: function () {} }
);


var User = sequelize.define('user', {
		email: Sequelize.STRING,
		username: Sequelize.STRING,
		password: Sequelize.STRING,		// is hashed client-side before storing
		role: Sequelize.ENUM('facilitator',
												 'participant')
});

var Event = sequelize.define('event', {
		type: Sequelize.ENUM('connect',
												 'disconnect',
												 'logIn',
												 'logOut',
												 'register',
												 'authenticateError',
												 'submitThought',
												 'newSession',
												 'newPrompt',
												 'deleteThought',
												 'reOrderThought',
												 'distribution'),
		data: Sequelize.INTEGER		// id for the subject of the event 
																// i.e. Event{ type: logIn, data: userId }
})

var Thought = sequelize.define('thought', {
		content: Sequelize.TEXT
});

var Prompt = sequelize.define('prompt', {
		content: Sequelize.TEXT
});

var Group = sequelize.define('group', {
		name: Sequelize.STRING,
		owner: Sequelize.INTEGER
});

var Distribution = sequelize.define('distribution', {
		readerId: Sequelize.INTEGER		// id of user recieving the distributed thought
});


Event.belongsTo(User);		// a user may have many events
User.hasMany(Event);

User.belongsTo(Group);		// a group may have many users
Group.hasMany(User);

Prompt.belongsTo(User);		// a user may have many prompts
User.hasMany(Prompt);

Thought.belongsTo(User);		// a user may have many thoughts
User.hasMany(Thought);

Thought.belongsTo(Prompt);		// a prompt may have may thoughts
Prompt.hasMany(Thought);

Distribution.belongsTo(Thought);		// a distribution may have many thoughts
Thought.hasMany(Distribution);

Prompt.belongsTo(Group);		// a group may have many prompts
Group.hasMany(Prompt);

Distribution.belongsTo(Group);		// a group may have many distributions
Group.hasMany(Distribution);


exports.Event = Event;
exports.User = User;
exports.Group = Group;
exports.Prompt = Prompt;
exports.Thought = Thought;
exports.Distribution = Distribution;

exports.start = function () {
	sequelize.sync({force: true}) // Use {force:true} only for updating the above models,
									 // it drops all current data
		.then(function (results) {
			User.findOrCreate({
				where: {
					email: 'test@thought-swap.com',
					username: 'admin',
					password: '098f6bcd4621d373cade4e832627b4f6', // md5 hash of test
					role: 'facilitator'
				} 
			});

			User.findOrCreate({
				where: {
					email: null,
					username: 'sillyname',
					password: '098f6bcd4621d373cade4e832627b4f6', // md5 hash of test
					role: 'participant'
				}
			});
		})
		.catch(function (error) {
			console.log(error);
		});
	console.log('Tables Synced');
	
};