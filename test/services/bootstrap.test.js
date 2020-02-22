const app = require('../../src/app');

describe('\'bootstrap\' service', () => {
  it('registered the service', () => {
    const service = app.service('bootstrap');
    expect(service).toBeTruthy();
  });
});
