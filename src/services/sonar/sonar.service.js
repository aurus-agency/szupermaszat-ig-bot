// Initializes the `sonar` service on path `/sonar`
const { Sonar } = require('./sonar.class');
const createModel = require('../../models/sonar.model');
const hooks = require('./sonar.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/sonar', new Sonar(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('sonar');

  service.hooks(hooks);
};
