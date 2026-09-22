import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SimulationService } from './simulation.service';
export declare class SimulationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly simulationService;
    server: Server;
    constructor(simulationService: SimulationService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSimulationUpdate(data: object): void;
    handleStart(dto: any, client: Socket): import("./entities/simulation-state.entity").SimulationState;
    handleStop(): {
        message: string;
    };
    handleReset(): import("./entities/simulation-state.entity").SimulationState;
    handleBlockCurrent(): object;
    handleGetState(): import("./entities/simulation-state.entity").SimulationState;
}
