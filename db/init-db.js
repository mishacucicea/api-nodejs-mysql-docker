/**
 * Initialize database with a leader user.
 */
const co = require('co');
const helper = require('../common/helper');
const logger = require('../common/logger');
const models = require('../modules/companies/models');
const constants = require('../constants');

/**
 * Initialize database with users.
 */
function* generate() {
  logger.debug('Initializing database');
  yield models.sequelize.sync({ alter: true });

  yield insertEntries();

  logger.debug('Initializing database - Completed');
}

function* insertEntries() {
  yield models.User.bulkCreate([
    {
      name: 'Admin',
      role: constants.UserRoles.admin,
      username: 'admin',
      password: helper.hashPassword('password')
    },
    {
      name: 'User01',
      role: constants.UserRoles.user,
      username: 'user',
      password: helper.hashPassword('password')
    }
  ]);

  yield models.Company.create({
    name: 'Root'
  });
}

co(generate)
  .then(process.exit)
  .catch(logger.error);
