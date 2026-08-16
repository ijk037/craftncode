import type { MeshPacket } from './Packet';
import type { MeshNode } from './Node';
import type { Incident } from './Incident';
import { getDistance } from '../utils/geo';

export interface TransmissionResult {
  success: boolean;
  snr: number;
  rssi: number;
  airtimeMs: number;
  lossReason?: 'OUT_OF_RANGE' | 'COLLISION_CONGESTION' | 'RF_DISASTER_INTERFERENCE' | 'TARGET_OFFLINE' | 'BATTERY_EXHAUSTED' | 'QUEUE_OVERFLOW';
}

export class SimulatedTransport {
  public getDistance(nodeA: { x: number; y: number }, nodeB: { x: number; y: number }): number {
    return getDistance(nodeA, nodeB);
  }

  public getIncidentInterference(
    nodeA: MeshNode, 
    nodeB: MeshNode, 
    incidents: Incident[]
  ): number {
    let maxInterference = 0;
    for (const incident of incidents) {
      if (!incident.active) continue;
      
      const distA = getDistance(nodeA, { x: incident.epicenterX, y: incident.epicenterY });
      const distB = getDistance(nodeB, { x: incident.epicenterX, y: incident.epicenterY });
      
      if (distA <= incident.radius || distB <= incident.radius) {
        maxInterference = Math.max(maxInterference, incident.rfInterferenceFactor);
      }
    }
    return maxInterference;
  }

  public calculateLinkMetrics(
    nodeA: MeshNode,
    nodeB: MeshNode,
    maxRangePixels: number,
    incidents: Incident[]
  ) {
    const distance = getDistance(nodeA, nodeB);
    const inRange = distance <= maxRangePixels;
    
    if (!inRange) {
      return { distance, quality: 0, snr: -20, rssi: -125, inRange: false };
    }

    const distRatio = Math.max(0, 1 - distance / maxRangePixels);
    const rfDegradation = this.getIncidentInterference(nodeA, nodeB, incidents);
    const txPowerFactor = nodeA.battery < 20 ? 0.75 : 1.0;
    
    let rawQuality = (distRatio * 0.7 + (nodeA.reliability + nodeB.reliability) / 2 * 0.3) * txPowerFactor;
    rawQuality = rawQuality * (1 - rfDegradation * 0.6);
    const quality = Math.round(Math.max(5, Math.min(100, rawQuality * 100)));

    const rssi = Math.round(-120 + (quality / 100) * 70);
    const snr = Math.round(-15 + (quality / 100) * 27);

    return { distance, quality, snr, rssi, inRange: true };
  }

  public send(
    packet: MeshPacket, 
    sourceNode: MeshNode, 
    targetNode: MeshNode, 
    maxRangePixels: number, 
    incidents: Incident[]
  ): TransmissionResult {
    if (targetNode.status === 'FAILED' || targetNode.status === 'OFFLINE') {
      return {
        success: false,
        snr: -20,
        rssi: -125,
        airtimeMs: 40,
        lossReason: 'TARGET_OFFLINE'
      };
    }

    if (sourceNode.battery <= 0 || targetNode.battery <= 0) {
      return {
        success: false,
        snr: -20,
        rssi: -125,
        airtimeMs: 20,
        lossReason: 'BATTERY_EXHAUSTED'
      };
    }

    const metrics = this.calculateLinkMetrics(sourceNode, targetNode, maxRangePixels, incidents);
    if (!metrics.inRange) {
      return {
        success: false,
        snr: metrics.snr,
        rssi: metrics.rssi,
        airtimeMs: 50,
        lossReason: 'OUT_OF_RANGE'
      };
    }

    if (targetNode.queueSize >= targetNode.maxQueueSize) {
      if (packet.priority > 0) {
        return {
          success: false,
          snr: metrics.snr,
          rssi: metrics.rssi,
          airtimeMs: 60,
          lossReason: 'QUEUE_OVERFLOW'
        };
      }
    }

    const channelSuccessProb = (metrics.quality / 100) * targetNode.reliability;
    const effectiveProb = packet.priority === 0 
      ? Math.min(0.99, channelSuccessProb * 1.25)
      : channelSuccessProb;

    const success = Math.random() <= effectiveProb;

    return {
      success,
      snr: metrics.snr,
      rssi: metrics.rssi,
      airtimeMs: Math.round(50 + (100 - metrics.quality) * 1.5),
      lossReason: success ? undefined : (metrics.quality < 30 ? 'RF_DISASTER_INTERFERENCE' : 'COLLISION_CONGESTION')
    };
  }
}
