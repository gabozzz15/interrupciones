"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterruptionsController = void 0;
const common_1 = require("@nestjs/common");
const interruptions_service_1 = require("./interruptions.service");
const trigger_interruption_dto_1 = require("./dto/trigger-interruption.dto");
let InterruptionsController = class InterruptionsController {
    interruptionsService;
    constructor(interruptionsService) {
        this.interruptionsService = interruptionsService;
    }
    trigger(dto) {
        return this.interruptionsService.trigger(dto);
    }
    getLog() {
        return this.interruptionsService.getLog();
    }
    getVectorTable() {
        return this.interruptionsService.getVectorTable();
    }
};
exports.InterruptionsController = InterruptionsController;
__decorate([
    (0, common_1.Post)('trigger'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trigger_interruption_dto_1.TriggerInterruptionDto]),
    __metadata("design:returntype", void 0)
], InterruptionsController.prototype, "trigger", null);
__decorate([
    (0, common_1.Get)('log'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InterruptionsController.prototype, "getLog", null);
__decorate([
    (0, common_1.Get)('vector-table'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InterruptionsController.prototype, "getVectorTable", null);
exports.InterruptionsController = InterruptionsController = __decorate([
    (0, common_1.Controller)('interruptions'),
    __metadata("design:paramtypes", [interruptions_service_1.InterruptionsService])
], InterruptionsController);
//# sourceMappingURL=interruptions.controller.js.map