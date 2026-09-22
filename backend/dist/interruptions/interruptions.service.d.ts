import { SimulationService } from '../simulation/simulation.service';
import { TriggerInterruptionDto } from './dto/trigger-interruption.dto';
export declare class InterruptionsService {
    private readonly simulationService;
    constructor(simulationService: SimulationService);
    trigger(dto: TriggerInterruptionDto): object;
    getLog(): {
        log: import("../simulation/entities/simulation-state.entity").InterruptionLogEntry[];
    };
    getVectorTable(): {
        vectorTable: {
            vector: number;
            type: string;
            isr: string;
            address: string;
        }[];
    };
    handleTimerEvent(payload: {
        pid: number;
        tick: number;
    }): void;
}
