const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const ActivationCode = sequelize.define('ActivationCode', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'activation_codes',
  timestamps: true
});

module.exports = ActivationCode; 