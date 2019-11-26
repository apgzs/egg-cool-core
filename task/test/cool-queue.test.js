'use strict';

const mock = require('egg-mock');

describe('test/cool-queue.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/cool-queue-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, coolQueue')
      .expect(200);
  });
});
