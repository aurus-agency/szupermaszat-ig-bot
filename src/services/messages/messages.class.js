/* eslint-disable no-unused-vars */
exports.Messages = class Messages {
  constructor (options, app) {
    this.options = options || {};
    this.app = app;
  }

  async getMessages() {
    const client = await this.app.service('core').client();
    console.log('Getting messages from inbox...');
    const messages = await client.feed.directInbox();
    let items = [];
    let users = [];
    do {
      items.push(await messages.items());
    } while(messages.isMoreAvailable());
    items.forEach((outer) => {
      outer.forEach((inner) => {
        users.push(inner);
      });
    });
    return users;
  }

  async getPendingMessages() {
    const client = await this.app.service('core').client();
    console.log('Getting pending message requests...');
    const messages = await client.feed.directPending();
    let items = [];
    let pending = [];
    do {
      items.push(await messages.items());
    } while(messages.isMoreAvailable());
    items.forEach((outer) => {
      outer.forEach((inner) => {
        pending.push(inner);
      });
    });
    return pending;
  }

  async get (id, params) {}
};
