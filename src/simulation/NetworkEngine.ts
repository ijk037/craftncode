import type { MeshNode } from '../models/Node';
import type { MeshGateway } from '../models/Gateway';
import type { Incident } from '../models/Incident';
import { SimulatedTransport } from '../models/Transport';

export interface NetworkTopologyConfig {
  nodeCount: number; // 30 - 50
  width: number; // canvas logical width (e.g., 1100)
  height: number; // canvas logical height (e.g., 650)
  rangeKm: number; // simulated range in km (default 5km)
  kmToPixelScale: number; // pixels per km (e.g., 40 px/km => 5km = 200px)
}

export class NetworkEngine {
  private transport = new SimulatedTransport();

  public rangeKmToPixels(rangeKm: number, scale: number = 40): number {
    return rangeKm * scale;
  }

  public generateDefaultTopology(config: NetworkTopologyConfig): {
    nodes: MeshNode[];
    gateways: MeshGateway[];
    incidents: Incident[];
  } {
    const { width, height, nodeCount } = config;
    const nodes: MeshNode[] = [];
    const gateways: MeshGateway[] = [];

    // 1. Initial Incidents (Disaster Zones)
    const incidents: Incident[] = [
      {
        id: 'inc-quake-01',
        type: 'EARTHQUAKE',
        name: 'Sector 4 Tremor Epicenter',
        epicenterX: width * 0.22,
        epicenterY: height * 0.45,
        radius: 140,
        severity: 'HIGH',
        active: true,
        startedAt: Date.now(),
        description: 'M6.4 structural collapse zone with high RF attenuation and rubble blockage.',
        rfInterferenceFactor: 0.45,
      },
      {
        id: 'inc-flood-02',
        type: 'FLOOD',
        name: 'River Basin Flash Flood',
        epicenterX: width * 0.58,
        epicenterY: height * 0.75,
        radius: 120,
        severity: 'MEDIUM',
        active: false,
        startedAt: Date.now(),
        description: 'Rising water levels threatening ground relay nodes.',
        rfInterferenceFactor: 0.3,
      }
    ];

    // 2. Strategic Relief Gateways
    const gatewayLocations = [
      { id: 'gw-sat-01', name: 'Relief SatCom Egress Alpha', x: width * 0.88, y: height * 0.25, services: ['SATCOM', 'COMMAND_UPLINK'] },
      { id: 'gw-cell-02', name: 'Emergency LTE Tower Bravo', x: width * 0.90, y: height * 0.70, services: ['CELLULAR_4G', 'FIRST_NET'] },
      { id: 'gw-drone-03', name: 'Airborne Drone Uplink Charlie', x: width * 0.62, y: height * 0.18, services: ['DRONE_RELAY', 'SATCOM'] },
    ];

    gatewayLocations.forEach((gw, idx) => {
      const nodeId = `node-gw-${idx + 1}`;
      nodes.push({
        id: nodeId,
        name: gw.name,
        type: 'GATEWAY',
        x: gw.x,
        y: gw.y,
        battery: 98,
        status: 'HEALTHY',
        powerMode: 'NORMAL',
        reliability: 0.98,
        queueSize: 0,
        maxQueueSize: 50,
        signalQuality: 95,
        neighbours: [],
        incidentIds: [],
        recentPacketIds: [],
        totalPacketsForwarded: 0,
        totalPacketsDropped: 0,
        totalPacketsOriginated: 0,
      });

      gateways.push({
        id: gw.id,
        nodeId: nodeId,
        name: gw.name,
        x: gw.x,
        y: gw.y,
        status: 'AVAILABLE',
        capacity: 25,
        currentLoad: 0,
        supportedServices: gw.services as any,
        reliability: 0.98,
        uplinkLatencyMs: 85,
        totalPacketsDelivered: 0,
        totalSosDelivered: 0,
      });
    });

    // 3. Command HQ Node
    nodes.push({
      id: 'node-cmd-01',
      name: 'Mobile Disaster Ops HQ',
      type: 'COMMAND',
      x: width * 0.82,
      y: height * 0.48,
      battery: 100,
      status: 'HEALTHY',
      powerMode: 'NORMAL',
      reliability: 0.99,
      queueSize: 0,
      maxQueueSize: 50,
      signalQuality: 98,
      neighbours: [],
      incidentIds: [],
      recentPacketIds: [],
      totalPacketsForwarded: 0,
      totalPacketsDropped: 0,
      totalPacketsOriginated: 0,
    });

    // 4. Victim Nodes
    const victimClusters = [
      { count: 6, centerX: width * 0.14, centerY: height * 0.35, spread: 80, namePrefix: 'Victim Group Alpha' },
      { count: 5, centerX: width * 0.18, centerY: height * 0.65, spread: 90, namePrefix: 'Victim Group Bravo' },
      { count: 4, centerX: width * 0.28, centerY: height * 0.20, spread: 70, namePrefix: 'Isolated Shelter Charlie' },
    ];

    let victimCounter = 1;
    victimClusters.forEach(cluster => {
      for (let i = 0; i < cluster.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * cluster.spread;
        const x = Math.max(30, Math.min(width - 30, cluster.centerX + Math.cos(angle) * dist));
        const y = Math.max(30, Math.min(height - 30, cluster.centerY + Math.sin(angle) * dist));
        const battery = Math.round(25 + Math.random() * 65);

        nodes.push({
          id: `node-vic-${victimCounter}`,
          name: `${cluster.namePrefix} #${victimCounter}`,
          type: 'VICTIM',
          x,
          y,
          battery,
          status: battery < 20 ? 'LOW_BATTERY' : 'HEALTHY',
          powerMode: battery < 20 ? 'POWER_SAVE' : 'NORMAL',
          reliability: 0.85 + Math.random() * 0.12,
          queueSize: 0,
          maxQueueSize: 50,
          signalQuality: 80,
          neighbours: [],
          incidentIds: [],
          recentPacketIds: [],
          totalPacketsForwarded: 0,
          totalPacketsDropped: 0,
          totalPacketsOriginated: 0,
        });
        victimCounter++;
      }
    });

    // 5. Tactical Relays
    const relayGridCols = 5;
    const relayGridRows = 4;
    const colStep = (width * 0.55) / relayGridCols;
    const rowStep = (height * 0.75) / relayGridRows;

    let relayCounter = 1;
    for (let r = 0; r < relayGridRows; r++) {
      for (let c = 0; c < relayGridCols; c++) {
        if (nodes.length >= nodeCount) break;

        const baseX = width * 0.25 + c * colStep;
        const baseY = height * 0.15 + r * rowStep;
        const jitterX = (Math.random() - 0.5) * (colStep * 0.7);
        const jitterY = (Math.random() - 0.5) * (rowStep * 0.7);
        const x = Math.max(50, Math.min(width - 50, baseX + jitterX));
        const y = Math.max(40, Math.min(height - 40, baseY + jitterY));
        const battery = Math.round(45 + Math.random() * 55);

        nodes.push({
          id: `node-rel-${relayCounter}`,
          name: `Mesh Relay R-${relayCounter.toString().padStart(2, '0')}`,
          type: 'RELAY',
          x,
          y,
          battery,
          status: battery < 20 ? 'LOW_BATTERY' : 'HEALTHY',
          powerMode: battery < 20 ? 'POWER_SAVE' : 'NORMAL',
          reliability: 0.90 + Math.random() * 0.09,
          queueSize: 0,
          maxQueueSize: 50,
          signalQuality: 88,
          neighbours: [],
          incidentIds: [],
          recentPacketIds: [],
          totalPacketsForwarded: 0,
          totalPacketsDropped: 0,
          totalPacketsOriginated: 0,
        });
        relayCounter++;
      }
    }

    this.recalculateTopologyLinks(nodes, config.rangeKm, config.kmToPixelScale, incidents);

    return { nodes, gateways, incidents };
  }

  public recalculateTopologyLinks(
    nodes: MeshNode[],
    rangeKm: number,
    kmToPixelScale: number = 40,
    incidents: Incident[] = []
  ): void {
    const maxRangePixels = this.rangeKmToPixels(rangeKm, kmToPixelScale);

    nodes.forEach(node => {
      node.incidentIds = incidents
        .filter(inc => inc.active && this.transport.getDistance(node, { x: inc.epicenterX, y: inc.epicenterY }) <= inc.radius)
        .map(inc => inc.id);
    });

    for (let i = 0; i < nodes.length; i++) {
      const nodeA = nodes[i];
      nodeA.neighbours = [];

      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const nodeB = nodes[j];

        if (nodeA.status === 'FAILED' || nodeA.status === 'OFFLINE' ||
            nodeB.status === 'FAILED' || nodeB.status === 'OFFLINE') {
          continue;
        }

        const metrics = this.transport.calculateLinkMetrics(nodeA, nodeB, maxRangePixels, incidents);
        if (metrics.inRange) {
          nodeA.neighbours.push(nodeB.id);
        }
      }
    }
  }
}
