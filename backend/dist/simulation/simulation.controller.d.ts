import { SimulationService } from './simulation.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { StartSimulationDto } from './dto/start-simulation.dto';
export declare class SimulationController {
    private readonly simulationService;
    constructor(simulationService: SimulationService);
    start(dto: StartSimulationDto): import("./entities/simulation-state.entity").SimulationState;
    getState(): import("./entities/simulation-state.entity").SimulationState;
    addProcess(dto: CreateProcessDto): import("./entities/process.entity").ProcessControlBlock;
    reset(): import("./entities/simulation-state.entity").SimulationState;
    stop(): {
        message: string;
    };
    blockCurrent(): object;
    getGantt(): {
        gantt: import("./entities/simulation-state.entity").GanttEntry[];
    };
    getVectorTable(): {
        vectorTable: {
            vector: number;
            type: string;
            isr: string;
            address: string;
        }[];
    };
}
