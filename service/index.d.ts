import { Service, Context } from 'egg';
/**
 * 服务基类
 */
export declare abstract class BaseService extends Service {
    sqlParams: any;
    constructor(ctx: Context);
    /**
     * 执行SQL并获得分页数据
     * @param sql 执行的sql语句
     * @param query 分页查询条件
     */
    sqlRenderPage(sql: any, query: any): Promise<{
        list: any;
        pagination: {
            page: number;
            size: number;
            total: number;
        };
    }>;
    /**
     * 原生查询
     * @param sql
     * @param params
     */
    nativeQuery(sql: any, params?: any): Promise<any>;
    /**
     * 参数安全性检查
     * @param params
     */
    paramSafetyCheck(params: any): Promise<boolean>;
    /**
     * 获得查询个数的SQL
     * @param sql
     */
    getCountSql(sql: any): string;
    /**
     * 单表分页查询
     * @param entity
     * @param query
     * @param option
     */
    page(query: any, option: any, entity: any): Promise<{
        list: any;
        pagination: {
            page: number;
            size: number;
            total: any;
        };
    }>;
    /**
     * 所有数据
     * @param entity
     */
    list(entity: any): Promise<any>;
    /**
     * 新增/修改
     * @param entity 实体
     * @param param 数据
     */
    addOrUpdate(param: any, entity: any): Promise<void>;
    /**
     * 新增/修改
     * @param entity 实体
     * @param param 数据
     */
    add(param: any, entity: any): Promise<void>;
    /**
     * 新增/修改
     * @param entity 实体
     * @param param 数据
     */
    update(param: any, entity: any): Promise<void>;
    /**
     * 根据ID获得信息
     * @param entity 实体
     * @param id id
     */
    info(id: any, entity: any): Promise<any>;
    /**
     * 删除
     * @param entity
     * @param ids
     */
    delete(ids: any, entity: any): Promise<void>;
    /**
     * 修改数据之后执行的操作，修改数据包括默认的：'add'、'update'、'delete' 等方法
     * @param data
     */
    modifyAfter(data: any): Promise<void>;
    /**
     * query
     * @param data
     * @param query
     */
    renderPage(data: any, query: any): {
        list: any;
        pagination: {
            page: number;
            size: number;
            total: any;
        };
    };
    /**
     * 构造分页查询条件
     *  @param entity 实体
     *  @param query 查询条件
     *  @param option 配置信息
     */
    getPageFind(query: any, option: any, entity: any): any;
    /**
     * 设置sql
     * @param condition 条件是否成立
     * @param sql sql语句
     * @param params 参数
     */
    protected setSql(condition: any, sql: any, params?: any[]): any;
    /**
     * 获得上下文
     */
    getContext(): Context;
    /**
     * 获得ORM操作对象
     */
    getRepo(): any;
    /**
     * 获得ORM管理
     */
    getOrmManager(): import("typeorm").EntityManager;
    /**
     * 获得ORM连接类
     */
    getOrmConnection(): import("typeorm").Connection;
    /**
     * 获得query请求参数
     */
    protected getQuery(): import("egg").PlainObject<string>;
    /**
     * 获得body请求参数
     */
    protected getBody(): any;
}
