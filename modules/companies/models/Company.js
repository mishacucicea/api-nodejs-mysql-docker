/**
 * Schema for Company.
 */
module.exports = (sequelize, DataTypes) =>
  sequelize.define('company', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    image: { type: DataTypes.STRING(512) },
    url: { type: DataTypes.STRING(512) }
  });
