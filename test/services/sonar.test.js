const app = require('../../src/app');

describe('\'sonar\' service', () => {
  it('registered the service', () => {
    const service = app.service('sonar');
    expect(service).toBeTruthy();
  });
});
