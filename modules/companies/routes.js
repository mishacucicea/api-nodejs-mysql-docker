/**
 * Contains all routes.
 */
const constants = require('../../constants');

const jwtAuth = constants.Passports.jwt;
const { manager, user } = constants.UserRoles;

module.exports = {
  '/login': { post: { controller: 'AuthController', method: 'login' } },
  '/companies': {
    get: {
      controller: 'CompanyController', method: 'search'
    },
    post: {
      controller: 'CompanyController', method: 'search', auth: jwtAuth, access: [user, manager]
    }
  },
  '/companies/:id': {
    get: {
      controller: 'CompanyController', method: 'get'
    }
  }
};
