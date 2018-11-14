/**
 * Controller for authentication endpoints.
 */
const service = require('../services/AuthService');

/**
 * Login by username and password.
 * @param req the request
 * @param res the response
 */
function* login(req, res) {
  res.send(yield service.login(req.body));
}


module.exports = {
  login
};
