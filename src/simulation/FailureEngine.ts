import type { MeshNode } from '../models/Node';
import type { MeshGateway } from '../models/Gateway';
import type { MeshPacket } from '../models/Packet';
import type { Incident } from '../models/Incident';
import { NetworkEngine } from './NetworkEngine';

export class FailureEngine {
  private networkEngine = new NetworkEngine();

  public toggleNodeFailure(
    nodeId: string,
    nodes: MeshNode[],
    rangeKm: number,
    incidents: Incident[]
  ): { affectedNode: MeshNode | null; newStatus: string } {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { affectedNode: null, newStatus: 'UNKNOWN' };

    if (node.status === 'FAILED' || node.status === 'OFFLINE') {
      node.status = node.battery < 20 ? 'LOW_BATTERY' : 'HEALTHY';
      node.reliability = Math.max(0.85, node.reliability);
    } else {
      node.status = 'FAILED';
      node.reliability = 0.0;
    }

    this.networkEngine.recalculateTopologyLinks(nodes, rangeKm, 40, incidents);

    return { affectedNode: node, newStatus: node.status };
  }

  public drainBattery(
    nodeId: string,
    nodes: MeshNode[],
    rangeKm: number,
    incidents: Incident[]
  ): MeshNode | null {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    node.battery = 5;
    node.status = 'LOW_BATTERY';
    node.powerMode = 'POWER_SAVE';
    node.reliability = 0.70;

    this.networkEngine.recalculateTopologyLinks(nodes, rangeKm, 40, incidents);
    return node;
  }

  public rechargeBattery(
    nodeId: string,
    nodes: MeshNode[],
    rangeKm: number,
    incidents: Incident[]
  ): MeshNode | null {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    node.battery = 100;
    if (node.status !== 'FAILED') {
      node.status = 'HEALTHY';
    }
    node.powerMode = 'NORMAL';
    node.reliability = 0.95;

    this.networkEngine.recalculateTopologyLinks(nodes, rangeKm, 40, incidents);
    return node;
  }

  public toggleGatewayStatus(
    gatewayId: string,
    gateways: MeshGateway[],
    nodes: MeshNode[],
    rangeKm: number,
    incidents: Incident[]
  ): MeshGateway | null {
    const gw = gateways.find(g => g.id === gatewayId);
    if (!gw) return null;

    gw.status = gw.status === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE';

    const gwNode = nodes.find(n => n.id === gw.nodeId);
    if (gwNode) {
      gwNode.status = gw.status === 'OFFLINE' ? 'FAILED' : 'HEALTHY';
    }

    this.networkEngine.recalculateTopologyLinks(nodes, rangeKm, 40, incidents);
    return gw;
  }

  public handleTopologyReroute(
    failedNodeId: string,
    activePackets: MeshPacket[]
  ): { reroutedCount: number; droppedCount: number } {
    let reroutedCount = 0;
    let droppedCount = 0;

    for (const packet of activePackets) {
      if (packet.status === 'DELIVERED' || packet.status === 'FAILED' || packet.status === 'EXPIRED') {
        continue;
      }

      if (packet.nextHopId === failedNodeId) {
        packet.inTransit = false;
        packet.transitProgress = 0;
        packet.nextHopId = undefined;
        packet.retryCount++;

        if (packet.retryCount > 3) {
          packet.status = 'FAILED';
          packet.failureReason = `TARGET_HOP_${failedNodeId}_FAILED`;
          droppedCount++;
        } else {
          packet.status = 'QUEUED';
          packet.pathHistory.push({
            nodeId: packet.currentNodeId,
            timestamp: Date.now(),
            action: 'REROUTED',
            note: `Next-hop ${failedNodeId} collapsed. Dynamic reroute discovered.`
          });
          reroutedCount++;
        }
      }

      if (packet.currentNodeId === failedNodeId) {
        packet.status = 'FAILED';
        packet.failureReason = `NODE_${failedNodeId}_POWER_FAILURE`;
        droppedCount++;
      }
    }

    return { reroutedCount, droppedCount };
  }
}
