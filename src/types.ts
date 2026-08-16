// ==========================================
// RESQ-MESH CONSOLIDATED TYPE DEFINITIONS
// ==========================================

export type NodeType = 'CITIZEN' | 'RELAY' | 'GATEWAY' | 'VICTIM';
export type NodeStatus = 'HEALTHY' | 'LOW_BATTERY' | 'CONGESTED' | 'FAILED' | 'OFFLINE';
export type PowerMode = 'NORMAL' | 'POWER_SAVE' | 'CRITICAL_CONSERVATION';

export interface MeshNode {
  id: string;
  name: string;
  type: NodeType;
  x: number;
  y: number;
  battery: number;
  status: NodeStatus;
  powerMode: PowerMode;
  reliability: number;
  queueSize: number;
  maxQueueSize: number;
  signalQuality: number;
  neighbours: string[];
  incidentIds: string[];
  recentPacketIds: string[];
  totalPacketsForwarded: number;
  totalPacketsDropped: number;
  totalPacketsOriginated: number;
}

export type GatewayService = 'SATCOM' | 'CELLULAR_4G' | 'DRONE_RELAY' | 'FIRST_NET' | 'COMMAND_UPLINK';
export type GatewayStatus = 'AVAILABLE' | 'CONGESTED' | 'OFFLINE';

export interface MeshGateway {
  id: string;
  nodeId: string;
  name: string;
  x: number;
  y: number;
  status: GatewayStatus;
  capacity: number;
  currentLoad: number;
  supportedServices: GatewayService[];
  reliability: number;
  totalPacketsDelivered: number;
  totalSosDelivered: number;
}

export type IncidentType = 'EARTHQUAKE' | 'FLOOD' | 'FIRE' | 'STORM' | 'INFRASTRUCTURE_COLLAPSE';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Incident {
  id: string;
  type: IncidentType;
  name: string;
  epicenterX: number;
  epicenterY: number;
  radius: number;
  severity: IncidentSeverity;
  active: boolean;
  startedAt: number;
  description: string;
  rfInterferenceFactor: number;
}

export type LogLevel = 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
export type LogCategory = 'ROUTING' | 'GATEWAY' | 'FAILURE' | 'SOS' | 'SYSTEM' | 'ACK' | 'STORE_FORWARD';

export interface EventLogItem {
  id: string;
  timestamp: number;
  timeString: string;
  category: LogCategory;
  level: LogLevel;
  message: string;
  nodeId?: string;
  packetId?: string;
  details?: Record<string, any>;
}

export type MessageType = 'SOS' | 'MEDICAL' | 'TRAPPED' | 'EVACUATION' | 'WATER' | 'FOOD' | 'STATUS' | 'ACK' | 'HEARTBEAT';
export type PacketPriority = 0 | 1 | 2; // 0 = Critical SOS, 1 = Urgent, 2 = Normal
export type PacketStatus = 'QUEUED' | 'IN_TRANSIT' | 'FORWARDING' | 'DELIVERED' | 'FAILED' | 'EXPIRED' | 'STORED';

export interface PacketHopHistory {
  nodeId: string;
  nodeName?: string;
  timestamp: number;
  action: 'ORIGINATED' | 'FORWARDED' | 'STORED' | 'DELIVERED' | 'DROPPED' | 'REROUTED';
  note?: string;
  batteryAtHop?: number;
  signalQuality?: number;
}

export interface MeshPacket {
  messageId: string;
  incidentId?: string;
  sourceNodeId: string;
  currentNodeId: string;
  nextHopId?: string;
  previousNodeId?: string;
  targetGatewayId?: string;
  messageType: MessageType;
  priority: PacketPriority;
  latitude: number;
  longitude: number;
  timestamp: number;
  ttl: number;
  hopCount: number;
  retryCount: number;
  status: PacketStatus;
  pathHistory: PacketHopHistory[];
  payload: string;
  isAck?: boolean;
  originalPacketId?: string;
  deliveredAt?: number;
  failureReason?: string;
  inTransit?: boolean;
  transitProgress?: number;
  transitSpeed?: number;
  sizeBytes: number;
}

export interface StructuredSosMicroFrame {
  incidentType: MessageType;
  priority: PacketPriority;
  victimCount: {
    adults: number;
    children: number;
    elderly: number;
    total: number;
  };
  hasInjuries: boolean;
  injuryDescription: string;
  locationDetails: string;
  extractedKeywords: string[];
  rawText: string;
  confidenceScore: number;
  hexMicroFrame: string;
}

export interface TransmissionResult {
  success: boolean;
  snr: number;
  rssi: number;
  airtimeMs: number;
  lossReason?: 'OUT_OF_RANGE' | 'COLLISION_CONGESTION' | 'RF_DISASTER_INTERFERENCE' | 'TARGET_OFFLINE' | 'BATTERY_EXHAUSTED' | 'QUEUE_OVERFLOW';
}

export interface LinkMetrics {
  distance: number;
  quality: number;
  snr: number;
  rssi: number;
  inRange: boolean;
}
