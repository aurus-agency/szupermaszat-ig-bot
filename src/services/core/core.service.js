// Initializes the `core` service on path `/core`
const { Core } = require('./core.class');
const hooks = require('./core.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/core', new Core(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('core');

  service.hooks(hooks);
};
