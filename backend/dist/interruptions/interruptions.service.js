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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterruptionsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const simulation_service_1 = require("../simulation/simulation.service");
let InterruptionsService = class InterruptionsService {
    simulationService;
    constructor(simulationService) {
        this.simulationService = simulationService;
    }
    trigger(dto) {
        switch (dto.type) {
            case 'TIMER':
                return this.simulationService.applyTimerInterrupt(dto.pid);
            case 'IO_COMPLETED':
                return this.simulationService.applyIoInterrupt(dto.pid, dto.ioDevice ?? 'DISK');
            case 'HARDWARE':
                return this.simulationService.applyHardwareInterrupt(dto.pid, dto.ioDevice ?? 'KEYBOARD');
            case 'SOFTWARE':
                return { message: 'Software interrupt received', pid: dto.pid };
            default:
                return { error: 'Unknown interruption type' };
        }
    }
    getLog() {
        return { log: this.simulationService.getInterruptionLog() };
    }
    getVectorTable() {
        return this.simulationService.getVectorTable();
    }
    handleTimerEvent(payload) {
        this.simulationService.applyTimerInterrupt(payload.pid);
    }
};
exports.InterruptionsService = InterruptionsService;
__decorate([
    (0, event_emitter_1.OnEvent)('interruption.timer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InterruptionsService.prototype, "handleTimerEvent", null);
exports.InterruptionsService = InterruptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [simulation_service_1.SimulationService])
], InterruptionsService);
//# sourceMappingURL=interruptions.service.js.map