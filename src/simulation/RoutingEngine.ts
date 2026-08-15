import type { MeshNode } from '../models/Node';
import type { MeshGateway } from '../models/Gateway';
import type { MeshPacket } from '../models/Packet';
import type { Incident } from '../models/Incident';
import { SimulatedTransport } from '../models/Transport';

export interface RoutingWeights {
  w1GatewayProgress: number; // default 35
  w2LinkQuality: number;     // default 20
  w3BatteryHealth: number;   // default 20
  w4Reliability: number;     // default 15
  w5Congestion: number;      // default 25
  w6HopPenalty: number;      // default 15
}

export const DEFAULT_ROUTING_WEIGHTS: RoutingWeights = {
  w1GatewayProgress: 35,
  w2LinkQuality: 20,
  w3BatteryHealth: 20,
  w4Reliability: 15,
  w5Congestion: 25,
  w6HopPenalty: 15,
};

export interface CandidateScore {
  neighborId: string;
  neighborName: string;
  totalScore: number;
  progressScore: number;
  linkScore: number;
  batteryScore: number;
  reliabilityScore: number;
  congestionPenalty: number;
  hopPenalty: number;
  distanceToGateway: number;
}

export class RoutingEngine {
  private transport = new SimulatedTransport();

  public findBestGateway(
    currentNode: MeshNode,
    gateways: MeshGateway[],
    nodesMap: Map<string, MeshNode>
  ): MeshGateway | null {
    const availableGateways = gateways.filter(gw => gw.status !== 'OFFLINE');
    if (availableGateways.length === 0) return null;

    let bestGateway: MeshGateway | null = null;
    let minDistance = Infinity;

    for (const gw of availableGateways) {
      const gwNode = nodesMap.get(gw.nodeId);
      if (!gwNode || gwNode.status === 'FAILED' || gwNode.status === 'OFFLINE') continue;

      const dist = this.transport.getDistance(currentNode, gwNode);
      const loadPenalty = (gw.currentLoad / gw.capacity) * 80;
      const effectiveDist = dist + loadPenalty;

      if (effectiveDist < minDistance) {
        minDistance = effectiveDist;
        bestGateway = gw;
      }
    }

    return bestGateway || availableGateways[0];
  }

  public evaluateCandidates(
    packet: MeshPacket,
    currentNode: MeshNode,
    targetLocation: { x: number; y: number },
    nodesMap: Map<string, MeshNode>,
    maxRangePixels: number,
    incidents: Incident[],
    weights: RoutingWeights = DEFAULT_ROUTING_WEIGHTS
  ): CandidateScore[] {
    const candidates: CandidateScore[] = [];
    const currentDistToTarget = this.transport.getDistance(currentNode, targetLocation);

    for (const neighborId of currentNode.neighbours) {
      const neighbor = nodesMap.get(neighborId);
      if (!neighbor) continue;

      if (neighbor.status === 'FAILED' || neighbor.status === 'OFFLINE' || neighbor.battery <= 0) {
        continue;
      }

      const isPreviousNode = packet.previousNodeId === neighborId;
      const alreadyInPath = packet.pathHistory.some(h => h.nodeId === neighborId);

      const linkMetrics = this.transport.calculateLinkMetrics(currentNode, neighbor, maxRangePixels, incidents);
      if (!linkMetrics.inRange) continue;

      const neighborDistToTarget = this.transport.getDistance(neighbor, targetLocation);

      const progressDelta = (currentDistToTarget - neighborDistToTarget);
      const progressScore = Math.max(-1, Math.min(1.5, progressDelta / maxRangePixels));
      const linkScore = linkMetrics.quality / 100;
      const batteryScore = neighbor.battery / 100;
      const reliabilityScore = neighbor.reliability;
      const congestionPenalty = neighbor.queueSize / neighbor.maxQueueSize;

      const loopFactor = alreadyInPath ? 1.0 : (isPreviousNode ? 0.6 : 0.0);
      const hopPenalty = (packet.hopCount / packet.ttl) * 0.5 + loopFactor;

      const totalScore = 
        (weights.w1GatewayProgress * progressScore) +
        (weights.w2LinkQuality * linkScore) +
        (weights.w3BatteryHealth * batteryScore) +
        (weights.w4Reliability * reliabilityScore) -
        (weights.w5Congestion * congestionPenalty) -
        (weights.w6HopPenalty * hopPenalty);

      candidates.push({
        neighborId: neighbor.id,
        neighborName: neighbor.name,
        totalScore,
        progressScore,
        linkScore,
        batteryScore,
        reliabilityScore,
        congestionPenalty,
        hopPenalty,
        distanceToGateway: neighborDistToTarget
      });
    }

    return candidates.sort((a, b) => b.totalScore - a.totalScore);
  }

  public selectNextHop(
    packet: MeshPacket,
    currentNode: MeshNode,
    gateways: MeshGateway[],
    nodesMap: Map<string, MeshNode>,
    maxRangePixels: number,
    incidents: Incident[],
    weights: RoutingWeights = DEFAULT_ROUTING_WEIGHTS
  ): { nextHopNode: MeshNode | null; scoreDetails?: CandidateScore; reason?: string } {
    if (packet.isAck) {
      const sourceNode = nodesMap.get(packet.sourceNodeId);
      if (sourceNode && currentNode.neighbours.includes(sourceNode.id)) {
        return { nextHopNode: sourceNode, reason: 'DIRECT_ORIGIN_DELIVERY' };
      }
    }

    let targetCoords: { x: number; y: number } | null = null;

    if (packet.isAck) {
      const sourceNode = nodesMap.get(packet.sourceNodeId);
      if (sourceNode) {
        targetCoords = { x: sourceNode.x, y: sourceNode.y };
      }
    } else {
      let targetGw: MeshGateway | null = null;
      if (packet.targetGatewayId) {
        targetGw = gateways.find(g => g.id === packet.targetGatewayId && g.status !== 'OFFLINE') || null;
      }
      if (!targetGw) {
        targetGw = this.findBestGateway(currentNode, gateways, nodesMap);
        if (targetGw) {
          packet.targetGatewayId = targetGw.id;
        }
      }

      if (targetGw) {
        const gwNode = nodesMap.get(targetGw.nodeId);
        if (gwNode) {
          if (currentNode.neighbours.includes(gwNode.id) && gwNode.status !== 'FAILED') {
            return { nextHopNode: gwNode, reason: 'DIRECT_GATEWAY_HANDOFF' };
          }
          targetCoords = { x: gwNode.x, y: gwNode.y };
        }
      }
    }

    if (!targetCoords) {
      return { nextHopNode: null, reason: 'NO_VALID_TARGET_COORDINATES' };
    }

    const candidateScores = this.evaluateCandidates(
      packet,
      currentNode,
      targetCoords,
      nodesMap,
      maxRangePixels,
      incidents,
      weights
    );

    if (candidateScores.length === 0) {
      return { nextHopNode: null, reason: 'NO_ACTIVE_NEIGHBORS_IN_RANGE' };
    }

    const bestCandidate = candidateScores[0];

    if (bestCandidate.totalScore < -40 && packet.priority < 2) {
      return { nextHopNode: null, scoreDetails: bestCandidate, reason: 'PATH_BLOCKED_STORE_AND_FORWARD' };
    }

    const nextHopNode = nodesMap.get(bestCandidate.neighborId) || null;
    return { nextHopNode, scoreDetails: bestCandidate, reason: 'HEURISTIC_OPTIMAL_HOP' };
  }

  public generateAckPacket(
    deliveredPacket: MeshPacket,
    gatewayNode: MeshNode
  ): MeshPacket {
    return {
      messageId: `ACK-${deliveredPacket.messageId}-${Date.now().toString(36).slice(-4)}`,
      incidentId: deliveredPacket.incidentId,
      sourceNodeId: deliveredPacket.sourceNodeId,
      currentNodeId: gatewayNode.id,
      previousNodeId: gatewayNode.id,
      targetGatewayId: deliveredPacket.targetGatewayId,
      messageType: 'ACK',
      priority: 2,
      latitude: deliveredPacket.latitude,
      longitude: deliveredPacket.longitude,
      timestamp: Date.now(),
      ttl: 20,
      hopCount: 0,
      retryCount: 0,
      status: 'QUEUED',
      pathHistory: [
        {
          nodeId: gatewayNode.id,
          nodeName: gatewayNode.name,
          timestamp: Date.now(),
          action: 'ACK_SENT',
          note: `Relief Gateway ACK for SOS ${deliveredPacket.messageId}`,
          batteryAtHop: gatewayNode.battery,
          signalQuality: gatewayNode.signalQuality
        }
      ],
      payload: `[ACK CONFIRMED] Rescue dispatch notified for incident ${deliveredPacket.messageId}`,
      isAck: true,
      originalPacketId: deliveredPacket.messageId,
      inTransit: false,
      transitProgress: 0,
      transitSpeed: 0.25,
      sizeBytes: 32
    };
  }
}
