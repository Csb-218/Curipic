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
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique:false,
      primaryKey:false,
      references: {
        model: 'tags',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    photo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey:false,
      unique:false,
      references: {
        model: 'photos',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'phototags',
  });
  return phototags;
};