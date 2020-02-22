const app = require('../../src/app');

describe('\'followers\' service', () => {
  it('registered the service', () => {
    const service = app.service('followers');
    expect(service).toBeTruthy();
  });
});
