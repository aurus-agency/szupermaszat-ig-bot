// Initializes the `followers` service on path `/followers`
const { Followers } = require('./followers.class');
const hooks = require('./followers.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/followers', new Followers(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('followers');

  service.hooks(hooks);
};
