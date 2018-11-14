/**
 * Initialize and export all model schemas.
 */
const config = require('config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(config.db.url, config.db.options);
const models = { sequelize };

// Import definitions
models.Company = sequelize.import('./Company');
models.User = sequelize.import('./User');
models.User.belongsTo(models.Company);

module.exports = models;
