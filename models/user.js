'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize,DataTypes) => {
  class user extends Model {
    static associate(models) {
      // define association here
    }
  }
  user.init({
    username: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};