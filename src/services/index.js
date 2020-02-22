const sonar = require('./sonar/sonar.service.js');
const bootstrap = require('./bootstrap/bootstrap.service.js');
const core = require('./core/core.service.js');
const messages = require('./messages/messages.service.js');
const followers = require('./followers/followers.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(sonar);
  app.configure(bootstrap);
  app.configure(core);
  app.configure(messages);
  app.configure(followers);
};
