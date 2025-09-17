const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  lessonId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quality: {
    type: DataTypes.STRING,
    allowNull: true
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'videos',
  timestamps: true
});

module.exports = Video;