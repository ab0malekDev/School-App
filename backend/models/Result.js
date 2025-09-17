const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Result = sequelize.define('Result', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quizId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  takenAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'results',
  timestamps: true
});

module.exports = Result; 