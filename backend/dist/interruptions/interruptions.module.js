"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterruptionsModule = void 0;
const common_1 = require("@nestjs/common");
const interruptions_service_1 = require("./interruptions.service");
const interruptions_controller_1 = require("./interruptions.controller");
const simulation_module_1 = require("../simulation/simulation.module");
let InterruptionsModule = class InterruptionsModule {
};
exports.InterruptionsModule = InterruptionsModule;
exports.InterruptionsModule = InterruptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [simulation_module_1.SimulationModule],
        controllers: [interruptions_controller_1.InterruptionsController],
        providers: [interruptions_service_1.InterruptionsService],
    })
], InterruptionsModule);
//# sourceMappingURL=interruptions.module.js.map