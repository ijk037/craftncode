export type NodeType = 'VICTIM' | 'RELAY' | 'GATEWAY' | 'COMMAND';

export type NodeStatus = 'HEALTHY' | 'LOW_BATTERY' | 'CONGESTED' | 'FAILED' | 'OFFLINE';

export type PowerMode = 'NORMAL' | 'POWER_SAVE' | 'EMERGENCY';

export interface MeshNode {
  id: string;
  name: string;
  type: NodeType;
  x: number; // coordinate X in simulation canvas units
  y: number; // coordinate Y in simulation canvas units
  battery: number; // 0 - 100 percentage
  status: NodeStatus;
  powerMode: PowerMode;
  reliability: number; // 0.0 to 1.0 (packet pass-through probability)
  queueSize: number; // current items in queue
  maxQueueSize: number; // default 50
  signalQuality: number; // 0 - 100 (RSSI/SNR equivalent)
  neighbours: string[]; // Node IDs in wireless communication range
  incidentIds: string[]; // Active incidents affecting this node
  recentPacketIds: string[]; // Deduplication cache to prevent loops (sliding window)
  lastTransmittedAt?: number;
  totalPacketsForwarded: number;
  totalPacketsDropped: number;
  totalPacketsOriginated: number;
}
