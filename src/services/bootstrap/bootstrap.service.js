// Initializes the `bootstrap` service on path `/bootstrap`
const { Bootstrap } = require('./bootstrap.class');
const hooks = require('./bootstrap.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/bootstrap', new Bootstrap(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('bootstrap');

  service.hooks(hooks);
};
