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
exports.SimulationController = void 0;
const common_1 = require("@nestjs/common");
const simulation_service_1 = require("./simulation.service");
const create_process_dto_1 = require("./dto/create-process.dto");
const start_simulation_dto_1 = require("./dto/start-simulation.dto");
let SimulationController = class SimulationController {
    simulationService;
    constructor(simulationService) {
        this.simulationService = simulationService;
    }
    start(dto) {
        return this.simulationService.startSimulation(dto);
    }
    getState() {
        return this.simulationService.getSnapshot();
    }
    addProcess(dto) {
        return this.simulationService.addProcess(dto);
    }
    reset() {
        return this.simulationService.resetSimulation();
    }
    stop() {
        this.simulationService.stopSimulation();
        return { message: 'Simulation stopped' };
    }
    blockCurrent() {
        return this.simulationService.blockCurrentProcess();
    }
    getGantt() {
        return { gantt: this.simulationService.getGantt() };
    }
    getVectorTable() {
        return this.simulationService.getVectorTable();
    }
};
exports.SimulationController = SimulationController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [start_simulation_dto_1.StartSimulationDto]),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "start", null);
__decorate([
    (0, common_1.Get)('state'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "getState", null);
__decorate([
    (0, common_1.Post)('process'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_process_dto_1.CreateProcessDto]),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "addProcess", null);
__decorate([
    (0, common_1.Post)('reset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "reset", null);
__decorate([
    (0, common_1.Post)('stop'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "stop", null);
__decorate([
    (0, common_1.Post)('block-current'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "blockCurrent", null);
__decorate([
    (0, common_1.Get)('gantt'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "getGantt", null);
__decorate([
    (0, common_1.Get)('vector-table'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimulationController.prototype, "getVectorTable", null);
exports.SimulationController = SimulationController = __decorate([
    (0, common_1.Controller)('simulation'),
    __metadata("design:paramtypes", [simulation_service_1.SimulationService])
], SimulationController);
//# sourceMappingURL=simulation.controller.js.map