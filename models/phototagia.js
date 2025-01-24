'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class phototagia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  phototagia.init({
    tag_id: {
      type : DataTypes.ARRAY(DataTypes.INTEGER),
    },
    photo_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'phototagia',
  });
  return phototagia;
};