'use strict';

const path = require('path');
const assert = require('assert');
const requireDir = require('require-dir');

module.exports = app => {
    const {delegate, baseDir} = app.config.queue;
    const dir = path.join(app.baseDir, 'app', baseDir);
    const queues = requireDir(dir)
    app.config.bull = {
        clients: {},
        default: {
            redis: {}
        }
    };
    Object.keys(queues).forEach(e => {
        app.config.bull.clients[e] = {name: e}
    });
    app.config.bull.default = {
        redis: {
            ...app.config.redis.client
        }
    };
    app.addSingleton('bull', createQueue);

    app.beforeStart(() => {
        loadQueueToApp(app);
    });
};


function createQueue(config, app) {
    const {name, redis} = config;
    assert(name, '[egg-cool-task] name is required on config');
    assert(
        redis && redis.host && redis.port,
        '[egg-cool-task] host and port of redis are required on config'
    );

    app.Queue = config.Queue || require('bull');
    const queue = new app.Queue(name, config);

    app.beforeStart(() => {
        app.coreLogger.info(`[egg-cool-task] ${name} status OK, queue ready`);
    });

    return queue;
}

function loadQueueToApp(app) {
    const { delegate = 'task', baseDir  = 'task' } = app.config.queue;
    const dir = path.join(app.baseDir, 'app', baseDir);
    app.loader.loadToApp(dir, delegate, {
        inject: app,
        caseStyle: 'lower',
        filter(queue) {
            return typeof queue === 'object' && queue instanceof app.Queue;
        },
    });
}
