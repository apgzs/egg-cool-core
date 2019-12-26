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
        const find = function (body) {
            return es.search({
                index: model,
                body
            }).then(res => {
                return res.hits.hits.map(e => {
                    e._source.id = e._id
                    return e._source
                }) || []
            });
        };
        const findPage = function (page = 1, body = {}, size = 20) {
            body.from = (page - 1) * size;
            body.size = size;
            return es.search({
                index: model,
                body
            }).then(res => {
                const result = res.hits.hits.map(e => {
                    e._source.id = e._id
                    return e._source
                }) || []
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
        const findById = function (id) {
            return es.get({
                index: model,
                type: '_doc',
                id
            }).then(res => {
                res._source.id = res._id
                return res._source || undefined
            }).catch(e => {
                return undefined
            })
        };
        const findByIds = function (ids) {
            assert(ids, 'ids cannot be empty')
            return es.mget({
                index: model,
                type: '_doc',
                body: {
                    ids
                }
            }).then(res => {
                const result = res.docs.map(e => {
                    e._source.id = e._id
                    return e._source || 'undefined'
                })
                return result.filter(e => {
                    return e !== 'undefined'
                })
            }).catch(e => {
                return undefined
            })
        }
        const crateIndex = function (body, refresh = false) {
            if (body.id) {
                delete body.id
                return es.index({
                    id: body.id,
                    index: model,
                    refresh,
                    type: '_doc',
                    body
                })
            } else {
                return es.index({
                    index: model,
                    refresh,
                    type: '_doc',
                    body
                })
            }
        };
        const deleteById = function (id) {
            assert(id, 'id cannot be empty')
            return es.delete({
                index: model,
                type: '_doc',
                id
            })
        };
        const updateById = function (body) {
            const id = body.id
            assert(id, 'id cannot be empty')
            delete body.id
            return es.update({
                index: model,
                type: '_doc',
                id: id,
                body: {
                    doc: body
                }
            })
        };
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
        const nativeWithModel = function (method, body) {
            return es[method]({
                index: model,
                type: '_doc',
                body
            })
        };
        return {
            find,
            findCount,
            findById,
            findByIds,
            crateIndex,
            deleteById,
            updateById,
            native: es,
            nativeWithModel,
            findPage
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
