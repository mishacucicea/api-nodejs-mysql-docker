/**
 * This file defines helper methods.
 */
const _ = require('lodash');
const co = require('co');
const config = require('config');
const bcrypt = require('bcrypt-nodejs'); // TODO
const jwt = require('jsonwebtoken');
const errors = require('./errors');

/**
 * Wrap generator function to standard express function.
 * @param {Function} fn the generator function
 * @returns {Function} the wrapped function
 */
function wrapExpress(fn) {
  return function wrapGenerator(req, res, next) {
    co(fn(req, res, next)).catch(next);
  };
}

/**
 * Wrap all generators from object.
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress(obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress);
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'GeneratorFunction') {
      return wrapExpress(obj);
    }
    return obj;
  }
  _.each(obj, (value, key) => {
    obj[key] = autoWrapExpress(value);
  });
  return obj;
}

/**
 * Check if a password is correct or not against a hashed value.
 * @param {String} plainPassword the plain password to check
 * @param {String} hashedPassword the hashed password
 * @param {String} errorMessage the error message
 */
function checkPassword(plainPassword, hashedPassword, errorMessage) {
  if (!bcrypt.compareSync(plainPassword, hashedPassword)) {
    throw new errors.UnauthorizedError(errorMessage);
  }
}

/**
 * Hash a password.
 * @param {String} password the plain password to hashed
 * @return {String} the hashed password
 */
function hashPassword(password) {
  return bcrypt.hashSync(password);
}

/**
 * Sign the token.
 * @param {Object} obj the object to be sign
 * @returns {String} the token
 */
function signToken(obj) {
  return jwt.sign(obj, config.authSecret, { expiresIn: config.authExpiresIn });
}

/**
 * Find a entity matching the given criteria.
 * @param {Object} Model the model to query
 * @param {Object|String|Number} criteria the criteria (if object) or id (if string/number)
 * @return {Object} the entity
 * @private
 */
function findOne(Model, criteria) {
  let query;
  if (_.isObject(criteria)) {
    query = Model.findOne(criteria);
  } else {
    query = Model.findById(criteria);
  }
  return query;
}

/**
 * Ensure entity exists for given criteria. Return error if no result.
 * @param {Object} Model the model to query
 * @param {Object|String|Number} criteria the criteria (if object) or id (if string/number)
 * @param {String} errorMessage the error message
 * @param {Boolean} throwBadRequestIfNotFound throw bad request error if not found or not
 */
function* ensureExist(Model, criteria, errorMessage, throwBadRequestIfNotFound) {
  const result = yield findOne(Model, criteria);
  if (!result) {
    const msg = errorMessage || `${Model.name} not found`;

    if (throwBadRequestIfNotFound) {
      throw new errors.BadRequestError(msg);
    }
    throw new errors.NotFoundError(msg);
  }
  return result;
}

/**
 * Ensure entity does not exist for given criteria. Return error if found.
 * @param {Object} Model the model to query
 * @param {Object|String|Number} criteria the criteria (if object) or id (if string/number)
 * @param {String} errorMessage the error message
 */
function* ensureNotExist(Model, criteria, errorMessage) {
  const result = yield findOne(Model, criteria);
  if (result) {
    const msg = errorMessage || `${Model.name} already exists`;
    throw new errors.ConflictError(msg);
  }
}

/**
 * Find and update entity.
 * @param {Object} Model the model to query
 * @param {Object|String|Number} criteria the criteria (if object) or id (if string/number)
 * @param {Object} values the values to update
 * @param {String} errorMessage the error message
 * @returns {Object} the updated entity
 */
function* findOneAndUpdate(Model, criteria, values, errorMessage) {
  const entity = yield ensureExist(Model, criteria, errorMessage);
  return yield entity.update(values);
}

/**
 * Find and remove entity.
 * @param {Object} Model the model to query
 * @param {Object|String|Number} criteria the criteria (if object) or id (if string/number)
 * @param {String} errorMessage the error message
 * @returns {Object} the removed entity
 */
function* findOneAndRemove(Model, criteria, errorMessage) {
  const entity = yield ensureExist(Model, criteria, errorMessage);
  yield entity.destroy();
  return entity;
}

/**
 * Find and count all.
 * @param {Object} Model the model to query
 * @param {Object} filter the filter object
 * @param {Number} page the zero-based page index
 * @param {Number} pageSize the page size
 * @returns {Object} the results
 */
function* findAndCountAll(Model, filter, page, pageSize) {
  filter.limit = pageSize;
  filter.offset = page * pageSize;
  const result = yield Model.findAndCountAll(filter);

  return {
    total: result.count,
    page,
    pageSize,
    items: result.rows
  };
}

module.exports = {
  wrapExpress,
  autoWrapExpress,
  checkPassword,
  hashPassword,
  signToken,
  ensureExist,
  ensureNotExist,
  findOne,
  findOneAndUpdate,
  findOneAndRemove,
  findAndCountAll
};
