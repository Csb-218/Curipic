'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class phototags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  phototags.init({
    tag_id: DataTypes.INTEGER,
    photo_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'phototags',
  });
  return phototags;
};