'use strict'
var Sequelize = require('sequelize')
var sequelize = new Sequelize(
  process.env.TS_DB, // database name
  process.env.TS_USER, // username
  process.env.TS_PASS // password
  , { logging: function () {} }
)

var DROPTABLES = false

// if (process.env.TS_DROP === 'true') {
// 	DROPTABLES = true
// }

var User = sequelize.define('user', {
  email: Sequelize.STRING,
  username: {type: Sequelize.STRING, unique: true},
  password: Sequelize.STRING, // is hashed client-side before storing
  role: Sequelize.ENUM(
    'facilitator',
    'participant')
})

var Socket = sequelize.define('socket', {
  active: Sequelize.BOOLEAN,
  socketioId: Sequelize.STRING
})

var Event = sequelize.define('event', { // jshint ignore:line
  type: Sequelize.ENUM(
    'connect',
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
    'distribution',
    'navigation',
    'other'
  ),
  data: Sequelize.TEXT,
  socket: Sequelize.STRING
// id for the subject of the event 
// i.e. Event{ type: logIn, data: userId }
})

var Thought = sequelize.define('thought', {
  content: Sequelize.TEXT,
  deleted: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false}
})

var Prompt = sequelize.define('prompt', {
  content: Sequelize.TEXT
})

var Group = sequelize.define('group', {
  name: Sequelize.STRING
}, {
  instanceMethods: {
    addPersonWithName: function (sillyname) {
      return User.create({
        email: null,
        username: sillyname,
        password: null,
        role: 'participant',
        groupId: this.get('id')
      })
    }
  }
})

var Session = sequelize.define('session', {
  start: Sequelize.DATE,
  end: Sequelize.DATE,
  viewingDistribution: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false}
})

var Distribution = sequelize.define('distribution', {
})

var GroupColor = sequelize.define('group_color', {
  name: Sequelize.STRING,
  color: Sequelize.STRING,
  text: Sequelize.STRING
})

Event.belongsTo(User) // a user may have many events
User.hasMany(Event)

User.belongsTo(Group) // a group may have many users all about students
Group.hasMany(User)

Socket.belongsTo(User) // a user has many sockets
User.hasMany(Socket)

Group.belongsTo(User, { as: 'owner', constraints: false })
User.hasMany(Group, { as: 'facilitated', constraints: false })

Group.belongsTo(Session, {as: 'CurrentSession', constraints: false})
Session.belongsTo(Group) // a group has many sessions
Group.hasMany(Session)

Prompt.belongsTo(Session) // a session has many prompts
Session.hasMany(Prompt)

Prompt.belongsTo(User) // a user may have many prompts
User.hasMany(Prompt)

Thought.belongsTo(User) // a user may have many thoughts
User.hasMany(Thought)

Thought.belongsTo(Prompt) // a prompt may have may thoughts
Prompt.hasMany(Thought)

Distribution.belongsTo(Thought) // the thought that was distributed
Distribution.belongsTo(User); // the user who received this distribution's thought
Distribution.belongsTo(Group) // the group that the distribution occurred in

Thought.hasMany(Distribution) // a thought can be distributed to multiple users
Group.hasMany(Distribution) // each mapping is created as a single distribution object
User.hasMany(Distribution)

GroupColor.hasMany(Distribution)
Distribution.belongsTo(GroupColor)

exports.Event = Event
exports.User = User
exports.Socket = Socket
exports.Group = Group
exports.Session = Session
exports.Prompt = Prompt
exports.Thought = Thought
exports.Distribution = Distribution
exports.GroupColor = GroupColor
exports.sequelize = sequelize

exports.start = function () {
  return sequelize.sync({force: DROPTABLES}) // Use {force:true} only for updating the above models,
    // it drops all current data
    .then(function () {
      // mark all existing sockets as offline
      return Socket.update({
        active: false
      }, {
        where: {
          active: true
        }
      })
    })
    .then(function () {
      // create a new user as a faciliatator with username admin
      return User.findOrCreate({
        where: {
          email: 'test@thought-swap.com',
          username: 'admin',
          password: '098f6bcd4621d373cade4e832627b4f6', // md5 hash of test
          role: 'facilitator',
          groupId: null
        }
      })
    })

    .then(function (userResults) {
      // create a new group ("class") with name My Test Group
      return Group.findOrCreate({
        where: {
          name: 'My Test Group',
          ownerId: userResults[0].dataValues.id
        }
      })
        .then(function (group) {
          // create 3 new users to be students/participants in class/group mytestgroup
          return Promise.all([
            User.findOrCreate({
              where: {
                email: null,
                username: 'sillyname',
                password: null,
                role: 'participant',
                groupId: group[0].get('id')
              }
            }),

            User.findOrCreate({
              where: {
                email: null,
                username: 'testname',
                password: null,
                role: 'participant',
                groupId: group[0].get('id')
              }
            }),

            User.findOrCreate({
              where: {
                email: null,
                username: 'adam',
                password: null,
                role: 'participant',
                groupId: group[0].get('id')
              }
            })
          ])
        })
        .then(function () {
          // make a 2nd test group with 2 participants
          return Group.findOrCreate({
            where: {
              name: 'My Other Test Group',
              ownerId: userResults[0].dataValues.id
            }
          })
            .then(function (group) {
              return Promise.all([
                User.findOrCreate({
                  where: {
                    email: null,
                    username: 'goober',
                    password: null,
                    role: 'participant',
                    groupId: group[0].dataValues.id
                  }
                }),

                User.findOrCreate({
                  where: {
                    email: null,
                    username: 'jenkins',
                    password: null,
                    role: 'participant',
                    groupId: group[0].dataValues.id
                  }
                })
              ])
            })
        })
    })
    .then(function () { // thanks to the following for the colors: https://personal.sron.nl/~pault/
      return Promise.all([
        GroupColor.findOrCreate({
          where: {
            name: 'white',
            color: '#FFFFFF',
            text: '#000000'
          }
        }),
        GroupColor.findOrCreate({
          where: {
            name: 'sepia',
            color: '#5E2612',
            text: '#FFFFFF'
          }
        }),
        GroupColor.findOrCreate({
          where: {
            name: 'red',
            color: '#EE3333',
            text: '#FFFFFF'
          }
        }),
        GroupColor.findOrCreate({
          where: {
            name: 'orange',
            color: '#EE7722',
            text: '#000000'
          }
        }),
        GroupColor.findOrCreate({
          where: {
            name: 'yellow',
            color: '#FFEE33',
            text: '#000000'
          }
        }),
        GroupColor.findOrCreate({
          where: {
            name: 'green',
            color: '#66AA55',
            text: '#000000'
          }
        }),
        GroupColor.findOrCreate({
          where: {
            name: 'turquoise',
            color: '#11AA99',
            text: '#000000'
          }
        }),
        GroupColor.findOrCreate({
          where: {
            name: 'blue',
            color: '#3366AA',
            text: '#FFFFFF'
          }
        }),
        GroupColor.findOrCreate({
          where: {
            name: 'purple',
            color: '#992288',
            text: '#FFFFFF'
          }
        }),
        GroupColor.findOrCreate({
          where: {
            name: 'black',
            color: '#000000',
            text: '#FFFFFF'
          }
        })
      ])
    })
    .then(function () {
      if (DROPTABLES) {
        console.log('Testing: All Table Data Dropped')
      }
      console.info('Tables Synced')
      return true
    })
    .catch(function (error) {
      console.error(error)
    })
}
