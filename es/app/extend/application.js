'use strict';

const os = require('os');

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
        const find = async function (body) {
            return await es.search({
                index: model,
                body
            }).then(res => {
                return res.hits.hits.map(e => {
                    return e._source
                }) || []
            });
        };
        const findById = async function (id) {
            try {
                return await es.get({
                    index: model,
                    type: model,
                    id
                }).then(res => {
                    return res._source || undefined
                })
            } catch (e) {
                return undefined
            }
        };
        const findByIds = async function (ids) {
            return await es.mget({
                index: model,
                type: model,
                body: {
                    ids
                }
            }).then(res => {
                const result = res.docs.map(e => {
                    return e._source || 'undefined'
                })
                return result.filter(e => {
                    return e !== 'undefined'
                })
            })
        }
        const crateIndex = async function (body) {
            return await es.create({
                index: model,
                type: model,
                id: body.id,
                body
            })
        };
        const deleteById = async function (id) {
            return await es.delete({
                index: model,
                type: model,
                id
            })
        };
        const updateById = async function (body) {
            return await es.update({
                index: model,
                type: model,
                id: body.id,
                body: {
                    doc: body
                }
            })
        };
        const findCount = async function (body) {
            return await es.count({
                index: model,
                body
            }).then(res => {
                return res.count;
            })
        };
        const nativeWithModel = async function (method, body) {
            return await es[method]({
                index: model,
                type: model,
                body
            })
        };
        return {find, findCount, findById, findByIds, crateIndex, deleteById, updateById, native: es, nativeWithModel}
    },

    /**
     * 创建es索引
     * @param properties
     * @param model
     * @param shards
     */
    createIndex(properties, model, shards = 1) {
        model = model.toLowerCase();
        const body = {
            settings: {
                number_of_shards: shards,
                number_of_replicas: 0,
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
        const param = {
            index: model,
            body,
        };
        param.body = body;
        param.body.mappings[model] = {};
        param.body.mappings[model].properties = properties;
        this.es.indices.exists(param).then(async isExist => {
            if (!isExist) {
                await this.es.indices.create(param).then(resp => {
                    if (resp.acknowledged) {
                        this.logger.info('ES索引创建成功: %j', resp.index);
                    }
                });
            } else {
                const updateParam = {
                    index: model,
                    type: model,
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
