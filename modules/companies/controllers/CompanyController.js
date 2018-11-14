
/**
 * Controller for company endpoints.
 */
const service = require('../services/CompanyService');

/**
 * Creates a new company.
 * @param req the request
 * @param res the response
 */
function* create(req, res) {
  const result = yield service.create(req.body);
  res.status(201).send(result);
}

/**
 * Search company.
 * @param req the request
 * @param res the response
 */
function* search(req, res) {
  res.send(yield service.search(req.query));
}

/**
 * Get an company by id.
 * @param req the request
 * @param res the response
 */
function* get(req, res) {
  res.send(yield service.get(req.params.id));
}

/**
 * Update an company.
 * @param req the request
 * @param res the response
 */
function* update(req, res) {
  const result = yield service.update(req.body);
  res.send(result);
}

/**
 * Delete an company.
 * @param req the request
 * @param res the response
 */
function* remove(req, res) {
  yield service.remove(req.params);
  res.end();
}

module.exports = {
  create,
  search,
  get,
  update,
  remove
};
