/**
 * This service provides operations to manage User.
 */
const Joi = require('joi');
const _ = require('lodash');
const { Op } = require('sequelize');
const helper = require('../../../common/helper');
const logger = require('../../../common/logger');
const constants = require('../../../constants');
const { User } = require('../models');


/**
 * Omit password from the object.
 * @param {Object|Array} obj the object
 * @returns {Object|Array} the updated object without password
 * @private
 */
function omitPassword(obj) {
  if (obj.items) {
    obj.items = _.map(obj.items, omitPassword);
  }

  return _.omit(obj.toJSON ? obj.toJSON() : obj, 'password');
}

/**
 * Create a new user.
 * @param {Object} payload the payload
 * @returns {Object} the created user
 */
function* create(payload) {
  // Validate id and username to be unique
  yield helper.ensureNotExist(
    User, { where: { id: payload.id } },
    `User already existed with id=${payload.id}`
  );
  yield helper.ensureNotExist(
    User,
    { where: { username: payload.username } },
    `User already existed with username=${payload.username}`
  );

  // Hash password
  payload.password = helper.hashPassword(payload.password);

  payload.createdBy = payload.updatedBy;

  return omitPassword(yield User.create(payload));
}

create.schema = {
  payload: Joi.object().keys({
    id: Joi.string().max(45).required(),
    name: Joi.string().max(245).required(),
    role: Joi.string().valid(_.values(constants.UserRoles)).required(),
    username: Joi.string().max(245).required(),
    password: Joi.string().max(45).required(),
    updatedBy: Joi.string().max(45).required()
  })
};

/**
 * Search users.
 * @param {Object} criteria the search criteria
 * @returns {Object} the search result
 */
function* search(criteria) {
  const filter = {};

  if (criteria.query) {
    filter.where = {
      [Op.or]: {
        id: { [Op.like]: `%${criteria.query}%` },
        name: { [Op.like]: `%${criteria.query}%` }
      }
    };
  }

  return omitPassword(yield helper.findAndCountAll(User, filter, criteria.page, criteria.pageSize));
}

search.schema = {
  criteria: Joi.object().keys({
    page: Joi.number().integer().min(0).default(0),
    pageSize: Joi.number().integer().min(1).default(20),
    query: Joi.string()
  })
};

/**
 * Get a user by id.
 * @param {String} id the id
 * @returns {Object} the user
 */
function* get(id) {
  return omitPassword(yield helper.ensureExist(User, { where: { id } }));
}

get.schema = {
  id: Joi.string().max(45).required()
};

/**
 * Update a user.
 * @param {String} id the id
 * @param {Object} payload the payload
 * @returns {Object} the updated user
 */
function* update(id, payload) {
  const user = yield helper.ensureExist(User, { where: { id } });

  // Validate username to be unique
  if (user.username !== payload.username) {
    yield helper.ensureNotExist(
      User,
      { where: { username: payload.username } },
      `User already existed with username=${payload.username}`
    );
  }

  // Hash password
  payload.password = helper.hashPassword(payload.password);

  return omitPassword(yield user.update(payload));
}

update.schema = {
  id: Joi.string().max(45).required(),
  payload: Joi.object().keys({
    name: Joi.string().max(245).required(),
    role: Joi.string().valid(_.values(constants.UserRoles)).required(),
    username: Joi.string().max(245).required(),
    password: Joi.string().max(45).required()
  })
};

/**
 * Delete a user by id.
 * @param {String} id the id to delete
 * @returns {Object} the removed user
 */
function* remove(id) {
  const user = yield helper.ensureExist(User, { where: { id } });
  yield user.destroy();

  return omitPassword(user);
}

remove.schema = {
  id: Joi.string().max(45).required()
};


module.exports = {
  create,
  search,
  get,
  update,
  remove
};

logger.buildService(module.exports);
