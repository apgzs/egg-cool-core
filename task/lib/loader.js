'use strict';

const path = require('path');
const assert = require('assert');
const requireDir = require('require-dir');
const Redis = require('ioredis')

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

    app.Queue = config.Queue || require('bull');

    if (redis.cluster){
        const opts = {
            createClient: function (type) {
                return new Redis.Cluster(redis.nodes);
            },
            prefix: `{cooltask${name}}`,
            settings: {
                lockDuration: 30000,
                stalledInterval: 30000,
                maxStalledCount: 1,
                guardInterval: 5000,
                retryProcessDelay: 5000,
                drainDelay: 1,
                backoffStrategies: {},
                lockRenewTime: 15000
            }
        };
        return new app.Queue(name, opts);
    }else {
        return new app.Queue(name, config);
    }

    app.beforeStart(() => {
        app.coreLogger.info(`[egg-cool-task] ${name} status OK, queue ready`);
    });
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
