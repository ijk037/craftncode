import type { MeshNode } from '../models/Node';
import type { MeshPacket } from '../models/Packet';

export interface EnqueueResult {
  accepted: boolean;
  evictedPacket?: MeshPacket;
  reason?: string;
}

export class QueueEngine {
  public sortQueue(queue: MeshPacket[]): MeshPacket[] {
    return queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.timestamp - b.timestamp;
    });
  }

  public enqueue(
    node: MeshNode,
    queue: MeshPacket[],
    packet: MeshPacket
  ): EnqueueResult {
    if (node.status === 'FAILED' || node.status === 'OFFLINE') {
      packet.status = 'FAILED';
      packet.failureReason = 'NODE_OFFLINE';
      return { accepted: false, reason: 'TARGET_NODE_OFFLINE' };
    }

    if (queue.length < node.maxQueueSize) {
      queue.push(packet);
      this.sortQueue(queue);
      node.queueSize = queue.length;
      this.updateNodeCongestionStatus(node);
      return { accepted: true };
    }

    let lowestPriorityPacketIndex = -1;
    let worstPriorityValue = -1;

    for (let i = queue.length - 1; i >= 0; i--) {
      if (queue[i].priority > worstPriorityValue) {
        worstPriorityValue = queue[i].priority;
        lowestPriorityPacketIndex = i;
      }
    }

    if (packet.priority < worstPriorityValue && lowestPriorityPacketIndex !== -1) {
      const evicted = queue.splice(lowestPriorityPacketIndex, 1)[0];
      evicted.status = 'FAILED';
      evicted.failureReason = 'EVICTED_BY_SOS_PRIORITY';
      node.totalPacketsDropped++;

      queue.push(packet);
      this.sortQueue(queue);
      node.queueSize = queue.length;
      this.updateNodeCongestionStatus(node);

      return {
        accepted: true,
        evictedPacket: evicted,
        reason: `PRIORITY_PREEMPTION: Evicted Priority ${evicted.priority} packet for Priority ${packet.priority} SOS`
      };
    }

    packet.status = 'FAILED';
    packet.failureReason = 'QUEUE_CONGESTION_DROPPED';
    node.totalPacketsDropped++;
    return {
      accepted: false,
      reason: `QUEUE_OVERFLOW: Node queue full (${node.maxQueueSize}/${node.maxQueueSize})`
    };
  }

  public peekNextPacket(queue: MeshPacket[]): MeshPacket | null {
    if (queue.length === 0) return null;
    return queue[0];
  }

  public dequeue(node: MeshNode, queue: MeshPacket[]): MeshPacket | null {
    if (queue.length === 0) return null;
    const packet = queue.shift() || null;
    node.queueSize = queue.length;
    this.updateNodeCongestionStatus(node);
    return packet;
  }

  public updateNodeCongestionStatus(node: MeshNode): void {
    if (node.status === 'FAILED' || node.status === 'OFFLINE') return;

    if (node.battery < 20) {
      node.status = 'LOW_BATTERY';
      return;
    }

    const fillRatio = node.queueSize / node.maxQueueSize;
    if (fillRatio >= 0.70) {
      node.status = 'CONGESTED';
    } else {
      node.status = 'HEALTHY';
    }
  }

  public storePacket(node: MeshNode, packet: MeshPacket, reason: string): void {
    packet.status = 'STORED';
    packet.pathHistory.push({
      nodeId: node.id,
      nodeName: node.name,
      timestamp: Date.now(),
      action: 'STORED',
      note: `Store-and-Forward buffer: ${reason}`,
      batteryAtHop: node.battery,
      signalQuality: node.signalQuality
    });
  }
}
