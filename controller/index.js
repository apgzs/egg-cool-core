"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const egg_1 = require("egg");
const router_1 = require("egg-cool-router");
/**
 * 控制器基类
 */
class BaseController extends egg_1.Controller {
    constructor(ctx) {
        super(ctx);
        this.OpService = this.service.comm.data;
        this.init();
    }
    /**
     * 初始化
     */
    init() {
    }
    /**
     * 设置服务
     * @param service
     */
    setService(service) {
        this.OpService = service;
        this.OpService.setEntity(this.entity);
    }
    /**
     * 配置分页查询
     * @param option
     */
    setPageOption(option) {
        this.pageOption = option;
    }
    /**
     * 设置操作实体
     * @param entity
     */
    setEntity(entity) {
        this.entity = entity;
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
    /**
     * 分页查询数据
     */
    async page() {
        const result = await this.OpService.page(this.getQuery(), this.pageOption, this.entity);
        this.res({ data: result });
    }
    /**
     * 数据列表
     */
    async list() {
        const result = await this.OpService.list(this.entity);
        this.res({ data: result });
    }
    /**
     * 信息
     */
    async info() {
        const result = await this.OpService.info(this.getQuery().id, this.entity);
        this.res({ data: result });
    }
    /**
     * 新增
     */
    async add() {
        await this.OpService.add(this.getBody(), this.entity);
        this.res();
    }
    /**
     * 修改
     */
    async update() {
        await this.OpService.update(this.getBody(), this.entity);
        this.res();
    }
    /**
     * 删除
     */
    async delete() {
        await this.OpService.delete(this.getBody().ids, this.entity);
        this.res();
    }
    /**
     * 返回数据
     * @param op 返回配置，返回失败需要单独配置
     */
    res(op) {
        if (!op) {
            this.ctx.body = {
                code: 1000,
                message: 'success',
            };
            return;
        }
        if (op.isFail) {
            this.ctx.body = {
                code: op.code ? op.code : 1001,
                data: op.data,
                message: op.message ? op.message : 'fail',
            };
        }
        else {
            this.ctx.body = {
                code: op.code ? op.code : 1000,
                message: op.message ? op.message : 'success',
                data: op.data,
            };
        }
    }
}
tslib_1.__decorate([
    router_1.default.get('/page'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], BaseController.prototype, "page", null);
tslib_1.__decorate([
    router_1.default.get('/list'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], BaseController.prototype, "list", null);
tslib_1.__decorate([
    router_1.default.get('/info'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], BaseController.prototype, "info", null);
tslib_1.__decorate([
    router_1.default.post('/add'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], BaseController.prototype, "add", null);
tslib_1.__decorate([
    router_1.default.post('/update'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], BaseController.prototype, "update", null);
tslib_1.__decorate([
    router_1.default.post('/delete'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], BaseController.prototype, "delete", null);
exports.BaseController = BaseController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkJBQTBDO0FBQzFDLHNDQUErQjtBQTJCL0I7O0dBRUc7QUFDSCxNQUFzQixjQUFlLFNBQVEsZ0JBQVU7SUFLbkQsWUFBdUIsR0FBWTtRQUMvQixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN4QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVEOztPQUVHO0lBQ08sSUFBSTtJQUNkLENBQUM7SUFFRDs7O09BR0c7SUFDTyxVQUFVLENBQUUsT0FBTztRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztJQUM3QixDQUFDO0lBRUQ7OztPQUdHO0lBQ08sYUFBYSxDQUFFLE1BQWM7UUFDbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7T0FHRztJQUNPLFNBQVMsQ0FBRSxNQUFNO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7T0FFRztJQUNPLFFBQVE7UUFDZCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztJQUNsQyxDQUFDO0lBRUQ7O09BRUc7SUFDTyxPQUFPO1FBQ2IsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDakMsQ0FBQztJQUVEOztPQUVHO0lBRU8sS0FBSyxDQUFDLElBQUk7UUFDaEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMs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
