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
exports.SimulationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const event_emitter_1 = require("@nestjs/event-emitter");
const simulation_service_1 = require("./simulation.service");
let SimulationGateway = class SimulationGateway {
    simulationService;
    server;
    constructor(simulationService) {
        this.simulationService = simulationService;
    }
    handleConnection(client) {
        console.log(`[WS] Client connected: ${client.id}`);
        client.emit('simulation.update', this.simulationService.getSnapshot());
    }
    handleDisconnect(client) {
        console.log(`[WS] Client disconnected: ${client.id}`);
    }
    handleSimulationUpdate(data) {
        this.server.emit('simulation.update', data);
    }
    handleStart(dto, client) {
        const result = this.simulationService.startSimulation(dto);
        return result;
    }
    handleStop() {
        this.simulationService.stopSimulation();
        return { message: 'Simulation stopped' };
    }
    handleReset() {
        return this.simulationService.resetSimulation();
    }
    handleBlockCurrent() {
        return this.simulationService.blockCurrentProcess();
    }
    handleGetState() {
        return this.simulationService.getSnapshot();
    }
};
exports.SimulationGateway = SimulationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SimulationGateway.prototype, "server", void 0);
__decorate([
    (0, event_emitter_1.OnEvent)('simulation.update'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SimulationGateway.prototype, "handleSimulationUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SimulationGateway.prototype, "handleStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stop'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimulationGateway.prototype, "handleStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('reset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimulationGateway.prototype, "handleReset", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('block-current'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimulationGateway.prototype, "handleBlockCurrent", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get-state'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimulationGateway.prototype, "handleGetState", null);
exports.SimulationGateway = SimulationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    }),
    __metadata("design:paramtypes", [simulation_service_1.SimulationService])
], SimulationGateway);
//# sourceMappingURL=simulation.gateway.js.map