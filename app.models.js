var Sequelize = require('sequelize');
sequelize = new Sequelize('thoughtswap', // database name
						  'thoughtswap', // username
						  'thoughtswap', // password
	{ logging: function () {} }
);


var User = sequelize.define('user', {
		email: Sequelize.STRING,
		username: {type: Sequelize.STRING, unique: true},
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
});

var Session = sequelize.define('session', {
	start: Sequelize.DATE,
	end: Sequelize.DATE
});

var Distribution = sequelize.define('distribution', {
		readerId: Sequelize.INTEGER		// id of user recieving the distributed thought
});


Event.belongsTo(User);		// a user may have many events
User.hasMany(Event);

User.belongsTo(Group);		// a group may have many users all about students
Group.hasMany(User);

Group.belongsTo(User, { as: 'owner', constraints: false });
User.hasMany(Group, { as: 'facilitated', constraints: false });

Group.belongsTo(Session, {as: 'CurrentSession', constraints: false});
Group.hasMany(Session);
Session.belongsTo(Group);

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
exports.Session = Session;
exports.Prompt = Prompt;
exports.Thought = Thought;
exports.Distribution = Distribution;

exports.start = function () {
	return sequelize.sync({force: true}) // Use {force:true} only for updating the above models,
								  // it drops all current data
		.then( function (results) {
			return User.findOrCreate({
				where: {
					email: 'test@thought-swap.com',
					username: 'admin',
					password: '098f6bcd4621d373cade4e832627b4f6', // md5 hash of test
					role: 'facilitator',
					groupId: null
				} 
			});
		})
		
		.then(function (userResults) {
			// console.log('first user', userResults);

			Group.findOrCreate({
				where: {
					name: 'My Test Group',
					ownerId: userResults[0].dataValues.id,
				} 
			})
				.then(function (group) {
					User.findOrCreate({
						where: {
							email: null,
							username: 'sillyname',
							password: null,
							role: 'participant',
							groupId: group[0].dataValues.id
						}
					});

					User.findOrCreate({
						where: {
							email: null,
							username: 'testname',
							password: null,
							role: 'participant',
							groupId: group[0].dataValues.id
						}
					});

				});

			Group.findOrCreate({
				where: {
					name: 'My Other Test Group',
					ownerId: userResults[0].dataValues.id,
				} 
			})
				.then(function (group) {
					User.findOrCreate({
						where: {
							email: null,
							username: 'goober',
							password: null,
							role: 'participant',
							groupId: group[0].dataValues.id
						}
					});

					User.findOrCreate({
						where: {
							email: null,
							username: 'jenkins',
							password: null,
							role: 'participant',
							groupId: group[0].dataValues.id
						}
					});
					
				});

			console.log('Tables Synced');
		})
		.catch(function (error) {
			console.log(error);
		});
	
};