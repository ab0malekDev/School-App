const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  quizId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false // multiple_choice, true_false, etc.
  }
}, {
  tableName: 'questions',
  timestamps: true
});

module.exports = Question; 