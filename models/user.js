const { DataTypes } = require('sequelize');
const sequelize = require('../config/config.js');

const user = sequelize.define('user', {
  username: DataTypes.STRING,
  email: DataTypes.STRING,
});

module.exports = user;