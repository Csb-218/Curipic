'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize,DataTypes) => {
  class photo extends Model {
    static associate(models) {
      photo.belongsToMany(models.tag, {
        through: 'phototags',
        as: 'tags',
        foreignKey: 'photo_id',
      });
    }
  }
  photo.init({
    imageUrl: DataTypes.STRING,
    description: DataTypes.STRING,
    altDescription: DataTypes.STRING,
    dateSaved: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' }
    }
  }, {
    sequelize,
    modelName: 'photo',
  });
  return photo;
};