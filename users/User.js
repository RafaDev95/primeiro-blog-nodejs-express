const Sequelize = require('sequelize');
const connection = require('../database/connection');

const User = connection.define('users', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

// User.sync({ force: true });

module.exports = User;
