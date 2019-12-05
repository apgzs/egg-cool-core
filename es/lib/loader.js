'use strict';

const path = require('path');
const assert = require('assert');
const elasticsearch = require('elasticsearch');

module.exports = app => {
    const config = app.config.coolEs;
    assert(config.host || config.hosts, '[egg-cool-es] \'host\' or \'hosts\' is required on config');

    app.coreLogger.info('[egg-cool-es] connecting elasticsearch server');

    const client = new elasticsearch.Client(config);

    Object.defineProperty(app, 'es', {
        value: client,
        writable: false,
        configurable: false,
    });

    app.beforeStart(function () {
        client.ping({
            requestTimeout: 30000,
        }, function (error) {
            if (error) {
                app.coreLogger.error('[egg-cool-es] elasticsearch cluster is down with error: ' + error);
            } else {
                app.coreLogger.info('[egg-cool-es] elasticsearch connects successfully');
            }
        });
        loadEsToApp(app);
    });
};

function loadEsToApp(app) {
    const { baseDir  = 'esmodel' } = app.config.coolEs;
    const dir = path.join(app.baseDir, 'app', baseDir);
    app.loader.loadToApp(dir, baseDir, {
        inject: app,
        caseStyle: 'lower',
    });
}
