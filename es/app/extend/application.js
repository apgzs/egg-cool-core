'use strict';

const os = require('os');
const assert = require('assert');

module.exports = {
    /**
     * 获得文件名
     * @param filePathName
     * @returns {string}
     */
    fileName(filePathName) {
        if (os.type().toLowerCase().includes('windows')) {
            return filePathName.substring(filePathName.lastIndexOf('\\') + 1, filePathName.lastIndexOf('.'))
        }
        return filePathName.substring(filePathName.lastIndexOf('/') + 1, filePathName.lastIndexOf('.'))
    },

    /**
     * es通用操作
     * @param model
     */
    esModle(model) {
        const es = this.es;
        // 查询
        const find = function (body) {
            return es.search({
                index: model,
                body
            }).then(res => {
                return res.hits.hits.map(e => {
                    e._source.id = e._id;
                    return e._source
                }) || []
            });
        };
        // 分页查询
        const findPage = function (page = 1, body = {}, size = 20) {
            body.from = (page - 1) * size;
            body.size = size;
            return es.search({
                index: model,
                body
            }).then(res => {
                const result = res.hits.hits.map(e => {
                    e._source.id = e._id;
                    return e._source
                }) || [];
                return {
                    list: result,
                    pagination: {
                        page,
                        size,
                        total: res.hits.total.value
                    }
                }
            });
        };
        // 根据ID查询
        const findById = function (id) {
            return es.get({
                index: model,
                type: '_doc',
                id
            }).then(res => {
                res._source.id = res._id;
                return res._source || undefined
            }).catch(e => {
                return undefined
            })
        };
        // 根据多个ID查询
        const findByIds = function (ids) {
            assert(ids, 'ids cannot be empty');
            return es.mget({
                index: model,
                type: '_doc',
                body: {
                    ids
                }
            }).then(res => {
                const result = res.docs.map(e => {
                    e._source.id = e._id;
                    return e._source || 'undefined'
                });
                return result.filter(e => {
                    return e !== 'undefined'
                })
            }).catch(e => {
                return undefined
            })
        };
        // 创建索引
        const crateIndex = function (body, refresh = false, waitForActiveShards = 1) {
            if (body.id) {
                const id = body.id;
                delete body.id;
                return es.index({
                    id,
                    index: model,
                    refresh,
                    waitForActiveShards,
                    type: '_doc',
                    body
                })
            } else {
                return es.index({
                    index: model,
                    refresh,
                    waitForActiveShards,
                    type: '_doc',
                    body
                })
            }
        };
        // 批量操作 type： index、create、delete、update
        const batchIndex = function (bodys, type = 'index', refresh = false, waitForActiveShards = 1) {
            const list = [];
            for (const body of bodys) {
                const typeO = {};
                typeO[type] = {_index: model, _id: body.id};
                if (body.id) {
                    delete body.id
                }
                list.push(typeO);
                if (type !== 'delete') {
                    list.push(body)
                }
            }
            return es.bulk({
                waitForActiveShards,
                index: model,
                refresh,
                type: '_doc',
                body: list
            })
        };
        // 删除索引
        const deleteById = function (id, refresh = false, waitForActiveShards = 1) {
            assert(id, 'id cannot be empty');
            return es.delete({
                index: model,
                type: '_doc',
                refresh,
                waitForActiveShards,
                id
            })
        };
        // 批量删除索引
        const deleteByIds = function (ids = [], refresh = false, waitForActiveShards = 1) {
            const body = {
                query: {
                    bool: {
                        must: [
                            {
                                terms: {
                                    _id: ids
                                }
                            }
                        ]
                    }
                }
            };
            return es.deleteByQuery({
                index: model,
                type: '_doc',
                refresh,
                waitForActiveShards,
                body
            })
        };
        // 批量删除索引
        const deleteByQuery = function (body, refresh = false, waitForActiveShards = 1) {
            return es.deleteByQuery({
                index: model,
                type: '_doc',
                refresh,
                waitForActiveShards,
                body
            })
        };
        // 更新索引
        const updateById = function (body, refresh = false, waitForActiveShards = 1) {
            const id = body.id;
            assert(id, 'id cannot be empty');
            delete body.id;
            return es.update({
                waitForActiveShards,
                index: model,
                type: '_doc',
                id: id,
                refresh,
                body: {
                    doc: body
                }
            })
        };
        // 查询条数
        const findCount = function (body) {
            return es.count({
                index: model,
                body
            }).then(res => {
                return res.count;
            }).catch(e => {
                return undefined
            })
        };
        // 原生查询，带模型
        const nativeWithModel = function (method, body) {
            return es[method]({
                index: model,
                type: '_doc',
                body
            })
        };
        return {
            find, // 查询
            findCount, // 查询条数
            findById, // 根据ID查询
            findByIds, // 根据多个ID查询
            crateIndex, // 创建索引
            batchIndex, // 批量操作
            deleteById, // 删除索引
            deleteByIds, // 批量删除
            deleteByQuery, // 批量删除
            updateById, // 更新索引
            native: es, // 原生查询
            nativeWithModel, // 原生带模型查询
            findPage, // 分页查询
        }
    },

    /**
     * 创建es索引
     * @param properties 模型属性
     * @param model 模型
     * @param shards 分片
     * @param replicas 副本
     * @param analyzers 分词器
     */
    createIndex(configs) {
        let {properties, model, shards = 8, replicas = 0, analyzers} = configs
        model = model.toLowerCase();
        const body = {
            settings: {
                number_of_shards: shards,
                number_of_replicas: replicas,
                analysis: {
                    analyzer: {
                        comma: {type: 'pattern', pattern: ','},
                        blank: {type: 'pattern', pattern: ' '},
                    },
                },
                mapping: {
                    nested_fields: {
                        limit: 100,
                    },
                },
            },
            mappings: {},
        };
        if (analyzers) {
            for (const analyzer of analyzers) {
                for (const key in analyzer) {
                    body.settings.analysis.analyzer[key] = analyzer[key]
                }
            }
        }
        const param = {
            index: model,
            body,
        };
        param.body = body;
        param.body.mappings.properties = properties;
        this.es.indices.exists({index: model}).then(async isExist => {
            if (!isExist) {
                await this.es.indices.create(param).then(resp => {
                    if (resp.acknowledged) {
                        this.logger.info('ES索引创建成功: %j', resp.index);
                    }
                });
            } else {
                const updateParam = {
                    index: model,
                    body: param.body.mappings,
                };
                await this.es.indices.putMapping(updateParam).then(resp => {
                    if (resp.acknowledged) {
                        this.logger.info('ES索引更新成功: %j', param.index);
                    }
                });
            }
        });
        return this.esModle(model);
    }
};
