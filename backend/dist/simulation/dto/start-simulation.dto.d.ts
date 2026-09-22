declare class ProcessInputDto {
    pid: number;
    name: string;
    burstTime: number;
    arrivalTime?: number;
    priority?: number;
}
export declare class StartSimulationDto {
    algorithm?: string;
    quantum?: number;
    processes: ProcessInputDto[];
}
export {};
