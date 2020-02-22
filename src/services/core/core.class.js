/* eslint-disable no-unused-vars */
exports.Core = class Core {
  constructor (options, app) {
    this.options = options || {};
    this.app = app;
  }

  async client() {
    const c = await this.app.get('instagramClient');
    return c;
  }

  async account() {
    const a = await this.app.get('instagramUser');
    return a;
  }

  async get (id, params) {}
};
