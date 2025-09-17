const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  lastActive: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'devices',
  timestamps: true
});

module.exports = Device; 