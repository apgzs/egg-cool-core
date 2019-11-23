"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const egg_1 = require("egg");
const typeorm_1 = require("typeorm");
const _ = require("lodash");
// 基础配置
const conf = {
    size: 15,
    errTips: {
        noEntity: '未设置操作实体~',
        noId: '参数不存在"id"字段',
    },
};
/**
 * 服务基类
 */
class BaseService extends egg_1.Service {
    constructor(ctx) {
        super(ctx);
        this.sqlParams = [];
    }
    /**
     * 执行SQL并获得分页数据
     * @param sql 执行的sql语句
     * @param query 分页查询条件
     */
    async sqlRenderPage(sql, query) {
        const { size = conf.size, page = 1, order = 'createTime', sort = 'desc' } = query;
        if (order && sort) {
            if (!await this.paramSafetyCheck(order + sort)) {
                throw new Error('非法传参~');
            }
            sql += ` ORDER BY ${order} ${sort}`;
        }
        this.sqlParams.push((page - 1) * size);
        this.sqlParams.push(parseInt(size));
        sql += ' LIMIT ?,? ';
        let params = [];
        params = params.concat(this.sqlParams);
        const result = await this.nativeQuery(sql, params);
        const countResult = await this.nativeQuery(this.getCountSql(sql), params);
        return {
            list: result,
            pagination: {
                page: parseInt(page),
                size: parseInt(size),
                total: parseInt(countResult[0] ? countResult[0].count : 0),
            },
        };
    }
    /**
     * 原生查询
     * @param sql
     * @param params
     */
    async nativeQuery(sql, params) {
        if (_.isEmpty(params)) {
            params = this.sqlParams;
        }
        let newParams = [];
        newParams = newParams.concat(params);
        this.sqlParams = [];
        return await this.getOrmManager().query(sql, newParams);
    }
    /**
     * 参数安全性检查
     * @param params
     */
    async paramSafetyCheck(params) {
        const lp = params.toLowerCase();
        return !(lp.indexOf('update') > -1 || lp.indexOf('select') > -1 || lp.indexOf('delete') > -1 || lp.indexOf('insert') > -1);
    }
    /**
     * 获得查询个数的SQL
     * @param sql
     */
    getCountSql(sql) {
        sql = sql.replace('LIMIT', 'limit');
        return `select count(*) as count from (${sql.split('limit')[0]}) a`;
    }
    /**
     * 单表分页查询
     * @param entity
     * @param query
     * @param option
     */
    async page(query, option, entity) {
        if (!entity)
            throw new Error(conf.errTips.noEntity);
        const find = await this.getPageFind(query, option, entity);
        return this.renderPage(await find.getManyAndCount(), query);
    }
    /**
     * 所有数据
     * @param entity
     */
    async list(entity) {
        if (!entity)
            throw new Error(conf.errTips.noEntity);
        return await entity.find();
    }
    /**
     * 新增/修改
     * @param entity 实体
     * @param param 数据
     */
    async addOrUpdate(param, entity) {
        if (!entity)
            throw new Error(conf.errTips.noEntity);
        if (param.id) {
            await entity.update(param.id, param);
        }
        else {
            await entity.save(param);
        }
    }
    /**
     * 新增/修改
     * @param entity 实体
     * @param param 数据
     */
    async add(param, entity) {
        if (!entity)
            throw new Error(conf.errTips.noEntity);
        await entity.save(param);
    }
    /**
     * 新增/修改
     * @param entity 实体
     * @param param 数据
     */
    async update(param, entity) {
        if (!entity)
            throw new Error(conf.errTips.noEntity);
        if (!param.id)
            throw new Error(conf.errTips.noId);
        await entity.update(param.id, param);
    }
    /**
     * 根据ID获得信息
     * @param entity 实体
     * @param id id
     */
    async info(id, entity) {
        if (!entity)
            throw new Error(conf.errTips.noEntity);
        return await entity.findOne({ id });
    }
    /**
     * 删除
     * @param entity
     * @param ids
     */
    async delete(ids, entity) {
        if (!entity)
            throw new Error(conf.errTips.noEntity);
        if (ids instanceof Array) {
            await entity.delete(ids);
        }
        else {
            await entity.delete(ids.split(','));
        }
    }
    /**
     * query
     * @param data
     * @param query
     */
    renderPage(data, query) {
        const { size = conf.size, page = 1 } = query;
        return {
            list: data[0],
            pagination: {
                page: parseInt(page),
                size: parseInt(size),
                total: data[1],
            },
        };
    }
    /**
     * 构造分页查询条件
     *  @param entity 实体
     *  @param query 查询条件
     *  @param option 配置信息
     */
    getPageFind(query, option, entity) {
        let { size = conf.size, page = 1, order = 'createTime', sort = 'desc', keyWord = '' } = query;
        const find = entity
            .createQueryBuilder()
            .take(parseInt(size))
            .skip(String((page - 1) * size));
        if (option) {
            // 默认条件
            if (option.where) {
                find.where(option.where);
            }
            // 附加排序
            if (!_.isEmpty(option.addOrderBy)) {
                for (const key in option.addOrderBy) {
                    find.addOrderBy(key, option.addOrderBy[key].toUpperCase());
                }
            }
            // 关键字模糊搜索
            if (keyWord) {
                keyWord = `%${keyWord}%`;
                find.andWhere(new typeorm_1.Brackets(qb => {
                    const keyWordLikeFields = option.keyWordLikeFields;
                    for (let i = 0; i < option.keyWordLikeFields.length; i++) {
                        qb.orWhere(`${keyWordLikeFields[i]} like :keyWord`, { keyWord });
                    }
                }));
            }
            // 字段全匹配
            if (!_.isEmpty(option.fieldEq)) {
                for (const key of option.fieldEq) {
                    const c = {};
                    if (query[key]) {
                        c[key] = query[key];
                        find.andWhere(`${key} = :${key}`, c);
                    }
                }
            }
        }
        // 接口请求的排序
        if (sort && order) {
            find.addOrderBy(order, sort.toUpperCase());
        }
        return find;
    }
    /**
     * 设置sql
     * @param condition 条件是否成立
     * @param sql sql语句
     * @param params 参数
     */
    setSql(condition, sql, params) {
        let rSql = false;
        if (condition || (condition === 0 && condition !== '')) {
            rSql = true;
            this.sqlParams = this.sqlParams.concat(params);
        }
        return rSql ? sql : '';
    }
    /**
     * 获得上下文
     */
    getContext() {
        return this.ctx;
    }
    /**
     * 获得ORM操作对象
     */
    getRepo() {
        return this.ctx.repo;
    }
    /**
     * 获得ORM管理
     */
    getOrmManager() {
        return typeorm_1.getManager();
    }
    /**
     * 获得ORM连接类
     */
    getOrmConnection() {
        return typeorm_1.getConnection();
    }
    /**
     * 获得query请求参数
     */
    getQuery() {
        return this.ctx.request.query;
    }
    /**
     * 获得body请求参数
     */
    getBody() {
        return this.ctx.request.body;
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBdUM7QUFDdkMscUNBQThEO0FBQzlELDRCQUE0QjtBQUM1QixPQUFPO0FBQ1AsTUFBTSxJQUFJLEdBQUc7SUFDVCxJQUFJLEVBQUUsRUFBRTtJQUNSLE9BQU8sRUFBRTtRQUNMLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLElBQUksRUFBRSxhQUFhO0tBQ3RCO0NBQ0osQ0FBQztBQUVGOztHQUVHO0FBQ0gsTUFBc0IsV0FBWSxTQUFRLGFBQU87SUFHN0MsWUFBb0IsR0FBWTtRQUM1QixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLEtBQUssQ0FBQyxhQUFhLENBQUUsR0FBRyxFQUFFLEtBQUs7UUFDbEMsTUFBTSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLFlBQVksRUFBRSxJQUFJLEdBQUcsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBQ2xGLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtZQUNmLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUU7Z0JBQzVDLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDNUI7WUFDRCxHQUFHLElBQUksYUFBYyxLQUFNLElBQUssSUFBSyxFQUFFLENBQUM7U0FDM0M7UUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENB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