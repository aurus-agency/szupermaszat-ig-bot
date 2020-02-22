const app = require('../../src/app');

describe('\'core\' service', () => {
  it('registered the service', () => {
    const service = app.service('core');
    expect(service).toBeTruthy();
  });
});
