'use strict';

const mock = require('egg-mock');

describe('test/cool-pay.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/cool-pay-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, coolPay')
      .expect(200);
  });
});
