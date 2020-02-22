const { IgApiClient } = require('instagram-private-api');

module.exports = function (app) {
  const ig = new IgApiClient();
  app.set('instagramClient', ig);
};
