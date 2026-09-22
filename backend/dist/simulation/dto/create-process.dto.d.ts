export declare class CreateProcessDto {
    pid: number;
    name: string;
    burstTime: number;
    priority?: number;
    arrivalTime?: number;
    quantum?: number;
    registers?: {
        PC?: string;
        SP?: string;
        AX?: number;
        BX?: number;
    };
}
