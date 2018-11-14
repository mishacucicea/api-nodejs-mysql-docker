/**
 * Schema for User.
 */
module.exports = (sequelize, DataTypes) =>
  sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.INTEGER, allowNull: false },
    username: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(1024), allowNull: false } // Hashed
  });
