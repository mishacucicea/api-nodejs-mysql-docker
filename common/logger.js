/**
 * This module contains the winston logger configuration.
 */
const _ = require('lodash');
const winston = require('winston');
const fs = require('fs');
const util = require('util');
const config = require('config');
const Joi = require('joi');
const path = require('path');
const getParams = require('get-parameter-names');

const logFolder = path.dirname(config.log.filename);

if (!fs.existsSync(logFolder)) {
  fs.mkdirSync(logFolder);
}

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: config.log.level,
      timestamp: () => new Date().toISOString()
    }),
    new winston.transports.File({
      filename: config.log.filename,
      level: config.log.level,
      timestamp: () => new Date().toISOString(),
      maxFiles: config.log.maxFiles,
      maxsize: config.log.maxsize
    })
  ]
});

/**
 * Log error details with signature.
 * @param err the error
 * @param signature the signature
 */
logger.logFullError = function logFullError(err, signature) {
  if (!err) {
    return;
  }
  logger.debug(`Error happend in ${signature}`);
  const args = Array.prototype.slice.call(arguments);
  args.shift();
  logger.debug(...args);
  logger.debug(util.inspect(err));
  if (!err.logged) {
    logger.debug(err.stack);
    err.logged = true;
  }
};

/**
 * Remove invalid properties from the object and hide long arrays.
 * @param {Object} obj the object
 * @returns {Object} the new object with removed properties
 * @private
 */
function _sanitizeObject(obj) {
  // Array of field names that should not be logged
  const removeFields = ['password', 'token'];

  try {
    return JSON.parse(JSON.stringify(obj, (name, value) => {
      if (_.includes(removeFields, name)) {
        return '<removed>';
      }
      if (_.isArray(value) && value.length > 30) {
        return `Array(${value.length}`;
      }
      return value;
    }));
  } catch (e) {
    return obj;
  }
}

/**
 * Convert array with arguments to object.
 * @param {Array} params the name of parameters
 * @param {Array} arr the array with values
 * @private
 */
function _combineObject(params, arr) {
  const ret = {};
  _.each(arr, (arg, i) => {
    ret[params[i]] = arg;
  });
  return ret;
}

/**
 * Decorate all functions of a service and log debug information if DEBUG is enabled.
 * @param {Object} service the service
 */
logger.decorateWithLogging = function decorateWithLogging(service) {
  if (config.log.level !== 'debug') {
    return;
  }
  _.each(service, (method, name) => {
    const params = method.params || getParams(method);
    service[name] = function* serviceMethodWithLogging() {
      logger.debug(`ENTER ${name}`);
      logger.debug('input arguments');
      const args = Array.prototype.slice.call(arguments);
      logger.debug(util.inspect(_sanitizeObject(_combineObject(params, args))));
      try {
        const result = yield* method.apply(this, arguments);
        logger.debug(`EXIT ${name}`);
        logger.debug('output arguments');
        logger.debug(util.inspect(_sanitizeObject(result)));
        return result;
      } catch (e) {
        logger.logFullError(e, name);
        throw e;
      }
    };
  });
};

/**
 * Decorate all functions of a service and validate input values.
 * and replace input arguments with sanitized result form Joi
 * Service method must have a `schema` property with Joi schema
 * @param {Object} service the service
 */
logger.decorateWithValidators = function decorateWithValidators(service) {
  _.each(service, (method, name) => {
    if (!method.schema) {
      return;
    }
    const params = getParams(method);
    service[name] = function* serviceMethodWithValidation() {
      const args = Array.prototype.slice.call(arguments);
      const value = _combineObject(params, args);
      const normalized = yield new Promise((resolve) => {
        Joi.validate(value, method.schema, { abortEarly: false, allowUnknown: true }, (err, val) => {
          if (err) {
            throw err;
          } else {
            resolve(val);
          }
        });
      });
      const newArgs = [];
      // Joi will normalize values
      // for example string number '1' to 1
      // if schema type is number
      _.each(params, (param) => {
        newArgs.push(normalized[param]);
      });
      return yield method.apply(this, newArgs);
    };
    service[name].params = params;
  });
};

/**
 * Apply logger and validation decorators.
 * @param {Object} service the service to wrap
 */
logger.buildService = function buildService(service) {
  logger.decorateWithValidators(service);
  logger.decorateWithLogging(service);
};

module.exports = logger;
