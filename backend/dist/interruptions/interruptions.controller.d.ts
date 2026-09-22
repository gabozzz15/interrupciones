import { InterruptionsService } from './interruptions.service';
import { TriggerInterruptionDto } from './dto/trigger-interruption.dto';
export declare class InterruptionsController {
    private readonly interruptionsService;
    constructor(interruptionsService: InterruptionsService);
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
}
