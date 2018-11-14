/**
 * Controller for users endpoints.
 */
const service = require('../services/UserService');

/**
 * Create a new user.
 * @param req the request
 * @param res the response
 */
function* create(req, res) {
  const result = yield service.create(req.body);
  res.status(201).send(result);
}

/**
 * Search users.
 * @param req the request
 * @param res the response
 */
function* search(req, res) {
  res.send(yield service.search(req.query));
}

/**
 * Get a user by id.
 * @param req the request
 * @param res the response
 */
function* get(req, res) {
  res.send(yield service.get(req.params.id));
}

/**
 * Update a user.
 * @param req the request
 * @param res the response
 */
function* update(req, res) {
  const result = yield service.update(req.params.id, req.body);
  res.send(result);
}

/**
 * Delete a user.
 * @param req the request
 * @param res the response
 */
function* remove(req, res) {
  yield service.remove(req.params.id);
  res.end();
}

module.exports = {
  create,
  search,
  get,
  update,
  remove
};
