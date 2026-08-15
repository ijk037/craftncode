export type GatewayStatus = 'AVAILABLE' | 'CONGESTED' | 'OFFLINE';

export type UplinkService = 'SATCOM' | 'CELLULAR_4G' | 'FIRST_NET' | 'COMMAND_UPLINK' | 'DRONE_RELAY';

export interface MeshGateway {
  id: string;
  nodeId: string; // Associated MeshNode ID
  name: string;
  x: number;
  y: number;
  status: GatewayStatus;
  capacity: number; // max concurrent packet egress per tick (e.g., 20)
  currentLoad: number; // current egress throughput
  supportedServices: UplinkService[];
  reliability: number; // 0.0 - 1.0 uplink fidelity
  uplinkLatencyMs: number; // uplink connection latency (simulated)
  totalPacketsDelivered: number;
  totalSosDelivered: number;
}
