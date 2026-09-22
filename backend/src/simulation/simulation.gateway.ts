import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { SimulationService } from './simulation.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class SimulationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly simulationService: SimulationService) {}

  handleConnection(client: Socket) {
    console.log(`[WS] Client connected: ${client.id}`);
    // Send current state immediately on connect
    client.emit('simulation.update', this.simulationService.getSnapshot());
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] Client disconnected: ${client.id}`);
  }

  // ── Internal event → broadcast to all WS clients ─────────────────────────
  @OnEvent('simulation.update')
  handleSimulationUpdate(data: object) {
    this.server.emit('simulation.update', data);
  }

  // ── Incoming WS messages from clients (optional control via WS) ───────────

  @SubscribeMessage('start')
  handleStart(@MessageBody() dto: any, @ConnectedSocket() client: Socket) {
    const result = this.simulationService.startSimulation(dto);
    return result;
  }

  @SubscribeMessage('stop')
  handleStop() {
    this.simulationService.stopSimulation();
    return { message: 'Simulation stopped' };
  }

  @SubscribeMessage('reset')
  handleReset() {
    return this.simulationService.resetSimulation();
  }

  @SubscribeMessage('block-current')
  handleBlockCurrent() {
    return this.simulationService.blockCurrentProcess();
  }

  @SubscribeMessage('get-state')
  handleGetState() {
    return this.simulationService.getSnapshot();
  }
}
