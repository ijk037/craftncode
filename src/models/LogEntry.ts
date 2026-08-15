export type LogCategory = 'ROUTING' | 'SOS' | 'FAILURE' | 'ACK' | 'STORE_FORWARD' | 'GATEWAY' | 'SYSTEM';

export interface EventLogItem {
  id: string;
  timestamp: number;
  timeString: string;
  category: LogCategory;
  level: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
  message: string;
  nodeId?: string;
  packetId?: string;
  details?: Record<string, any>;
}
