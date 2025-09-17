const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const StudentAnswer = sequelize.define('StudentAnswer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  optionId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'student_answers',
  timestamps: true
});

module.exports = StudentAnswer; 