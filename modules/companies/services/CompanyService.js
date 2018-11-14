/**
 * This service provides operations to manage Companys.
 */
const Joi = require('joi');
const helper = require('../../../common/helper');
const logger = require('../../../common/logger');
const models = require('../models');


/**
 * Get an Company
 * @param {id} id the id
 * @returns {object} the Zone
 */
function* get(id) {
  return yield helper.ensureExist(models.Company, {
    where: { id },
    include: [{ all: true, nested: true }]
  });
}

get.schema = {
  id: Joi.number().integer().required()
};

/**
 * Search aggregates.
 * @param {Object} criteria the search criteria
 * @returns {Object} the search result
 */
function* search(criteria) {
  const filter = {};

  if (criteria.query) {
    filter.where = {
    };
  }

  return yield helper.findAndCountAll(models.Company, filter, criteria.page, criteria.pageSize);
}

search.schema = {
  criteria: Joi.object().keys({
    page: Joi.number().integer().min(0).default(0),
    pageSize: Joi.number().integer().min(1).default(20),
    query: Joi.string()
  })
};

/**
 * Update an aggregate.
 * @param {Object} payload the payload
 * @returns {Object} the updated aggregate
 */
function* update(payload) {
  return yield helper.findOneAndUpdate(
    models.Company,
    { where: { id: payload.id } },
    payload
  );
}

/**
 * Delete an aggregate by id.
 * @param {String} id the id
 * @returns {Object} the removed aggregate
 */
function* remove(id) {
  return yield helper.findOneAndRemove(
    models.Company,
    { where: { id } }
  );
}

remove.schema = {
  id: get.schema.id
};

module.exports = {
  get,
  search,
  update,
  remove
};

logger.buildService(module.exports);
