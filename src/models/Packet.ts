export type MessageType = 
  | 'SOS' 
  | 'MEDICAL' 
  | 'TRAPPED' 
  | 'EVACUATION' 
  | 'WATER' 
  | 'FOOD' 
  | 'STATUS'
  | 'HEARTBEAT'
  | 'ACK';

// 0 = CRITICAL (SOS, Medical, Trapped), 1 = URGENT (Evacuation, Water, Food), 2 = NORMAL (ACK, Status, Telemetry)
export type PacketPriority = 0 | 1 | 2;

export type PacketStatus = 
  | 'CREATED' 
  | 'QUEUED' 
  | 'FORWARDING' 
  | 'STORED' 
  | 'DELIVERED' 
  | 'FAILED' 
  | 'EXPIRED';

export interface HopRecord {
  nodeId: string;
  nodeName?: string;
  timestamp: number;
  action: 'ORIGINATED' | 'FORWARDED' | 'STORED' | 'REROUTED' | 'DELIVERED' | 'DROPPED' | 'ACK_SENT';
  note?: string;
  batteryAtHop?: number;
  signalQuality?: number;
}

export interface MeshPacket {
  messageId: string;
  incidentId?: string;
  sourceNodeId: string;
  currentNodeId: string;
  previousNodeId?: string;
  targetGatewayId?: string;
  nextHopId?: string;
  messageType: MessageType;
  priority: PacketPriority;
  latitude: number;
  longitude: number;
  timestamp: number;
  ttl: number; // default 20
  hopCount: number;
  retryCount: number;
  status: PacketStatus;
  pathHistory: HopRecord[];
  payload: string;
  isAck?: boolean;
  originalPacketId?: string;
  // Animation/Transit tracking
  inTransit: boolean;
  transitProgress: number; // 0.0 to 1.0
  transitSpeed: number; // progress per tick
  deliveredAt?: number;
  failureReason?: string;
  sizeBytes: number; // simulated payload size in bytes (e.g. 64B LoRa frame)
}
