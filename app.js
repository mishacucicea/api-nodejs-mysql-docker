/**
 * Contains express application configurations.
 */

const cors = require('cors');
const config = require('config');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const _ = require('lodash');
const logger = require('./common/logger');
const dotenv = require('dotenv');
const models = require('./modules/companies/models');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

require('./app-passport')(app);
require('./app-routes')(app);

app.use(passport.initialize());
// init db
models.sequelize.sync({ alter: true });

// The error handler,log error and return 500 error
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.logFullError(err, req.signature || `${req.method} ${req.url}`);
  const errorResponse = {};
  let status = err.httpStatus || 500;
  if (err.isJoi) {
    status = 400;
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409; // conflict
    if (err.errors[0]) {
      err.message = err.errors[0].message;
    }
  }

  if (_.isArray(err.details)) {
    errorResponse.fields = _.map(err.details, (detail) => {
      if (detail.path.length >= 1) {
        // Ignore 'payload.' or 'criteria.'
        detail.path = detail.path.slice(1);
      }
      return detail.path.join('.');
    }).join(', ');
    if (err.isJoi) {
      _.map(err.details, (e) => {
        if (e.message) {
          if (_.isUndefined(errorResponse.message)) {
            errorResponse.message = e.message;
          } else {
            errorResponse.message += ', ' + e.message;
          }
        }
      });
    }
  }
  if (_.isUndefined(errorResponse.message)) {
    errorResponse.message = err.message || 'Internal server error';
  }
  if (status === 500) {
    errorResponse.message = 'Internal server error';
  }

  res.status(status).json(errorResponse);
});

// Handle 404
// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => {
  res.status(404).json({
    code: 404,
    message: 'Page not found'
  });
});

app.listen(config.port, '0.0.0.0');
logger.info('Express server listening on port %d in %s mode', config.port, process.env.NODE_ENV);
