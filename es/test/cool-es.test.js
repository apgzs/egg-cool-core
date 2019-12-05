'use strict';

const mock = require('egg-mock');

describe('test/cool-es.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/cool-es-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, coolEs')
      .expect(200);
  });
});
