/**
 * This service provides authentication-related operations.
 */
const _ = require('lodash');
const Joi = require('joi');
const logger = require('../../../common/logger');
const helper = require('../../../common/helper');
const errors = require('../../../common/errors');
const { User } = require('../models');

/**
 * Login by email and password
 * @param {Object} payload the payload
 * @returns {Object} the user information
 */
function* login(payload) {
  const errorMessage = 'Wrong username or password';

  const user = yield User.findOne({
    where: {
      username: payload.username
    }
  });
  if (!user) {
    throw new errors.UnauthorizedError(errorMessage);
  }

  helper.checkPassword(payload.password, user.password, errorMessage);

  return {
    token: helper.signToken(_.pick(user, 'id', 'role', 'name'))
  };
}

login.schema = {
  payload: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
  })
};


module.exports = {
  login
};

logger.buildService(module.exports);
