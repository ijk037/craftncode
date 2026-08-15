import { create } from 'zustand';
import type { MeshNode } from '../models/Node';
import type { MeshGateway } from '../models/Gateway';
import type { MeshPacket, MessageType, PacketPriority } from '../models/Packet';
import type { Incident } from '../models/Incident';
import type { EventLogItem, LogCategory } from '../models/LogEntry';
import { NetworkEngine, type NetworkTopologyConfig } from '../simulation/NetworkEngine';
import { RoutingEngine, type RoutingWeights, DEFAULT_ROUTING_WEIGHTS } from '../simulation/RoutingEngine';
import { QueueEngine } from '../simulation/QueueEngine';
import { FailureEngine } from '../simulation/FailureEngine';
import { SimulatedTransport } from '../models/Transport';

export type AppUserRole = 'CITIZEN' | 'AUTHORITY';

export interface AuthorityUser {
  name: string;
  role: 'INCIDENT_COMMANDER' | 'MESH_FIELD_ENGINEER' | 'DISPATCH_OPERATOR';
  badgeId: string;
  sector: string;
}

export interface TwoWayMessage {
  id: string;
  sender: 'CITIZEN' | 'AUTHORITY';
  authorName: string;
  text: string;
  timestamp: number;
}

export interface CitizenSosTicket {
  ticketId: string;
  packetId: string;
  incidentType: MessageType;
  victimCount: number;
  hasInjuries: boolean;
  notes: string;
  timestamp: number;
  status: 'BROADCASTING' | 'ROUTING' | 'GATEWAY_DELIVERED' | 'RESCUE_DISPATCHED' | 'RESOLVED';
  hopProgress: number;
  lastUpdateMessage: string;
  ackPacketId?: string;
  
  // Rescue Accountability, Official Directives & ETA
  assignedUnit?: string;
  dispatchedBy?: string;
  etaMinutes?: number;
  officialDirective?: string;
  dispatchedAt?: number;
  twoWayMessages: TwoWayMessage[];
}

export interface MeshMetrics {
  totalCreated: number;
  totalDelivered: number;
  totalDropped: number;
  totalAcksDelivered: number;
  activeInTransit: number;
  activeQueued: number;
  activeStored: number;
  deliveryRate: number;
  avgHops: number;
  resiliencyScore: number;
}

export interface CreatePacketOptions {
  sourceNodeId: string;
  messageType: MessageType;
  priority?: PacketPriority;
  payload?: string;
  incidentId?: string;
  citizenTicketId?: string;
}

interface MeshState {
  // Portal & Role Switching
  activeRole: AppUserRole;
  authAuthority: AuthorityUser | null;
  citizenTickets: CitizenSosTicket[];
  resolvedTicketsHistory: CitizenSosTicket[];
  activeCitizenNodeId: string;

  // Topology
  nodes: MeshNode[];
  gateways: MeshGateway[];
  incidents: Incident[];
  nodeQueues: Record<string, MeshPacket[]>;
  
  // Packets & Telemetry
  packets: MeshPacket[];
  metrics: MeshMetrics;
  logs: EventLogItem[];

  // Interactivity & Selection
  selectedNodeId: string | null;
  selectedPacketId: string | null;
  inspectedPacket: MeshPacket | null;
  highlightedPathNodeIds: string[];

  // Simulation Parameters
  isRunning: boolean;
  tickSpeed: number;
  simulatedRangeKm: number;
  kmToPixelScale: number;
  weights: RoutingWeights;
  activeScenarioId: string | null;
  scenarioStep: number;
  scenarioDescription: string;

  // Actions
  setActiveRole: (role: AppUserRole) => void;
  loginAuthority: (user: AuthorityUser) => void;
  logoutAuthority: () => void;
  
  submitCitizenSos: (data: {
    incidentType: MessageType;
    victimCount: number;
    hasInjuries: boolean;
    notes: string;
  }) => CitizenSosTicket | null;

  dispatchRescueMission: (
    ticketId: string, 
    options: {
      unitName: string;
      etaMinutes: number;
      directive: string;
      officerName: string;
    }
  ) => void;

  resolveAndPurgeTicket: (ticketId: string) => void;
  clearCitizenTickets: () => void;

  sendTwoWayCitizenMessage: (ticketId: string, text: string) => void;
  sendTwoWayAuthorityMessage: (ticketId: string, text: string, officerName: string) => void;

  init: () => void;
  toggleSimulation: () => void;
  setRunning: (running: boolean) => void;
  stepSimulation: () => void;
  setRangeKm: (rangeKm: number) => void;
  setTickSpeed: (speedMs: number) => void;
  setWeights: (weights: Partial<RoutingWeights>) => void;
  selectNode: (nodeId: string | null) => void;
  moveNode: (nodeId: string, x: number, y: number) => void;
  selectPacket: (packetId: string | null) => void;
  
  createPacket: (options: CreatePacketOptions) => MeshPacket | null;
  injectSmsPacket: (rawSms: string, customCoords?: { lat: number; lng: number }) => MeshPacket | null;
  
  toggleNodeFailure: (nodeId: string) => void;
  drainNodeBattery: (nodeId: string) => void;
  rechargeNodeBattery: (nodeId: string) => void;
  toggleGatewayStatus: (gatewayId: string) => void;
  
  createIncident: (incident: Omit<Incident, 'id' | 'startedAt'>) => void;
  toggleIncident: (incidentId: string) => void;
  clearIncidents: () => void;

  triggerStressTest: (packetCount: 100 | 500 | 1000) => void;
  loadScenario: (scenarioIndex: number) => void;
  resetSimulation: () => void;
  clearLogs: () => void;
  addLog: (category: LogCategory, level: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS', message: string, meta?: { nodeId?: string; packetId?: string; details?: any }) => void;
}

const networkEngine = new NetworkEngine();
const routingEngine = new RoutingEngine();
const queueEngine = new QueueEngine();
const failureEngine = new FailureEngine();
const transport = new SimulatedTransport();

const INITIAL_CONFIG: NetworkTopologyConfig = {
  nodeCount: 36,
  width: 1100,
  height: 650,
  rangeKm: 5.0,
  kmToPixelScale: 40,
};

let packetCounter = 1;
let ticketCounter = 1;
let msgCounter = 1;

export const useMeshStore = create<MeshState>((set, get) => ({
  activeRole: 'CITIZEN',
  authAuthority: null,
  citizenTickets: [],
  resolvedTicketsHistory: [],
  activeCitizenNodeId: 'node-vic-1',

  nodes: [],
  gateways: [],
  incidents: [],
  nodeQueues: {},
  packets: [],
  metrics: {
    totalCreated: 0,
    totalDelivered: 0,
    totalDropped: 0,
    totalAcksDelivered: 0,
    activeInTransit: 0,
    activeQueued: 0,
    activeStored: 0,
    deliveryRate: 100,
    avgHops: 0,
    resiliencyScore: 98,
  },
  logs: [],
  selectedNodeId: null,
  selectedPacketId: null,
  inspectedPacket: null,
  highlightedPathNodeIds: [],

  isRunning: true,
  tickSpeed: 300,
  simulatedRangeKm: 5.0,
  kmToPixelScale: 40,
  weights: { ...DEFAULT_ROUTING_WEIGHTS },
  activeScenarioId: null,
  scenarioStep: 0,
  scenarioDescription: '',

  setActiveRole: (role) => {
    set({ activeRole: role });
  },

  loginAuthority: (user) => {
    set({ authAuthority: user, activeRole: 'AUTHORITY' });
    get().addLog('SYSTEM', 'SUCCESS', `Authority Access Granted: ${user.name} (${user.role}) - Sector ${user.sector}`);
  },

  logoutAuthority: () => {
    set({ authAuthority: null, activeRole: 'CITIZEN' });
    get().addLog('SYSTEM', 'INFO', 'Authority session ended. Returned to public citizen portal.');
  },

  submitCitizenSos: (data) => {
    const { nodes, activeCitizenNodeId } = get();
    const citizenNode = nodes.find(n => n.id === activeCitizenNodeId) || nodes.find(n => n.type === 'VICTIM') || nodes[0];
    if (!citizenNode) return null;

    // Ensure clock is actively running
    set({ isRunning: true });

    const ticketId = `SOS-REQ-${(ticketCounter++).toString().padStart(4, '0')}`;
    const payload = `[CITIZEN SOS ${ticketId}] ${data.victimCount} victims, ${data.hasInjuries ? 'INJURED' : 'UNINJURED'}, Note: ${data.notes || 'Immediate help needed'}`;

    const packet = get().createPacket({
      sourceNodeId: citizenNode.id,
      messageType: data.incidentType,
      priority: 0,
      payload,
    });

    if (!packet) return null;

    const newTicket: CitizenSosTicket = {
      ticketId,
      packetId: packet.messageId,
      incidentType: data.incidentType,
      victimCount: data.victimCount,
      hasInjuries: data.hasInjuries,
      notes: data.notes,
      timestamp: Date.now(),
      status: 'BROADCASTING',
      hopProgress: 0,
      lastUpdateMessage: 'Emergency signal transmitted into decentralized disaster mesh. Seeking nearest relay...',
      twoWayMessages: [
        {
          id: `msg-${msgCounter++}`,
          sender: 'CITIZEN',
          authorName: 'Trapped Citizen',
          text: `Emergency broadcasted: ${data.victimCount} people. ${data.notes}`,
          timestamp: Date.now(),
        }
      ],
    };

    set(state => ({
      citizenTickets: [newTicket, ...state.citizenTickets],
    }));

    get().addLog('SOS', 'CRITICAL', `[PUBLIC SOS] Citizen Portal created ticket #${ticketId} (Mapped to Mesh Frame #${packet.messageId})`, {
      packetId: packet.messageId,
      nodeId: citizenNode.id,
    });

    return newTicket;
  },

  dispatchRescueMission: (ticketId, options) => {
    const { citizenTickets, nodes } = get();
    const ticket = citizenTickets.find(t => t.ticketId === ticketId);
    if (!ticket) return;

    ticket.status = 'RESCUE_DISPATCHED';
    ticket.assignedUnit = options.unitName;
    ticket.dispatchedBy = options.officerName;
    ticket.etaMinutes = options.etaMinutes;
    ticket.officialDirective = options.directive;
    ticket.dispatchedAt = Date.now();
    ticket.lastUpdateMessage = `OFFICIAL DISPATCH CONFIRMED: ${options.unitName} dispatched by ${options.officerName}. ETA: ~${options.etaMinutes} mins.`;

    ticket.twoWayMessages.push({
      id: `msg-${msgCounter++}`,
      sender: 'AUTHORITY',
      authorName: options.officerName,
      text: `[OFFICIAL DIRECTIVE]: ${options.directive} (${options.unitName} en route, ETA ${options.etaMinutes}m)`,
      timestamp: Date.now(),
    });

    const gwNode = nodes.find(n => n.type === 'GATEWAY' && n.status !== 'FAILED') || nodes[0];
    const victimNode = nodes.find(n => n.id === ticket.packetId.replace('PKT-', '')) || nodes.find(n => n.type === 'VICTIM') || nodes[0];

    get().createPacket({
      sourceNodeId: gwNode.id,
      messageType: 'ACK',
      priority: 0,
      payload: `[COMMAND DISPATCH ACK] ${options.unitName} en route to ${ticket.ticketId}. ETA ${options.etaMinutes} mins.`,
    });

    get().addLog(
      'GATEWAY',
      'SUCCESS',
      `[COMMAND DISPATCH] ${options.officerName} dispatched ${options.unitName} to ${ticket.ticketId}. Reassurance transmitted to victim device.`,
      { nodeId: victimNode.id }
    );

    set({ citizenTickets: [...citizenTickets] });
  },

  resolveAndPurgeTicket: (ticketId: string) => {
    const { citizenTickets, resolvedTicketsHistory, nodes, nodeQueues, packets, selectedPacketId } = get();
    const ticket = citizenTickets.find(t => t.ticketId === ticketId);
    if (!ticket) return;

    ticket.status = 'RESOLVED';
    ticket.lastUpdateMessage = 'MISSION ACCOMPLISHED: Victims safely extracted & evacuated. Radio frames purged from mesh cache.';

    const packetId = ticket.packetId;
    const ackPacketId = ticket.ackPacketId;

    // Purge memory queues & deduplication cache on all nodes across the mesh network
    nodes.forEach(node => {
      if (nodeQueues[node.id]) {
        nodeQueues[node.id] = nodeQueues[node.id].filter(
          p => p.messageId !== packetId && p.messageId !== ackPacketId && p.originalPacketId !== packetId
        );
        node.queueSize = nodeQueues[node.id].length;
      }
      node.recentPacketIds = node.recentPacketIds.filter(
        id => id !== packetId && id !== ackPacketId
      );
    });

    // Remove active packet from in-flight and display lists
    const remainingPackets = packets.filter(p => p.messageId !== packetId && p.messageId !== ackPacketId);

    get().addLog(
      'GATEWAY',
      'SUCCESS',
      `[CACHE PURGED] SOS #${ticket.ticketId} marked RESOLVED (Safe Evacuation). Node memory buffers and deduplication caches wiped clean.`,
      { packetId }
    );

    set({
      citizenTickets: citizenTickets.filter(t => t.ticketId !== ticketId),
      resolvedTicketsHistory: [ticket, ...resolvedTicketsHistory],
      nodes: [...nodes],
      nodeQueues: { ...nodeQueues },
      packets: remainingPackets,
      selectedPacketId: selectedPacketId === packetId || selectedPacketId === ackPacketId ? null : selectedPacketId,
      inspectedPacket: null,
      highlightedPathNodeIds: [],
    });
  },

  clearCitizenTickets: () => {
    set({ citizenTickets: [], resolvedTicketsHistory: [] });
    get().addLog('SYSTEM', 'INFO', 'All citizen emergency tickets and active caches cleared.');
  },

  sendTwoWayCitizenMessage: (ticketId, text) => {
    const { citizenTickets } = get();
    const ticket = citizenTickets.find(t => t.ticketId === ticketId);
    if (!ticket) return;

    ticket.twoWayMessages.push({
      id: `msg-${msgCounter++}`,
      sender: 'CITIZEN',
      authorName: 'Trapped Citizen',
      text,
      timestamp: Date.now(),
    });

    get().addLog('SOS', 'INFO', `[CITIZEN UPDATE] Ticket ${ticketId}: "${text}"`);
    set({ citizenTickets: [...citizenTickets] });
  },

  sendTwoWayAuthorityMessage: (ticketId, text, officerName) => {
    const { citizenTickets } = get();
    const ticket = citizenTickets.find(t => t.ticketId === ticketId);
    if (!ticket) return;

    ticket.twoWayMessages.push({
      id: `msg-${msgCounter++}`,
      sender: 'AUTHORITY',
      authorName: officerName,
      text,
      timestamp: Date.now(),
    });

    get().addLog('GATEWAY', 'SUCCESS', `[AUTHORITY DIRECTIVE] Sent to ${ticketId} by ${officerName}: "${text}"`);
    set({ citizenTickets: [...citizenTickets] });
  },

  addLog: (category, level, message, meta) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0').slice(0, 2)}`;
    const newLog: EventLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      timeString,
      category,
      level,
      message,
      nodeId: meta?.nodeId,
      packetId: meta?.packetId,
      details: meta?.details,
    };

    set(state => ({
      logs: [newLog, ...state.logs].slice(0, 150),
    }));
  },

  init: () => {
    const { simulatedRangeKm, kmToPixelScale } = get();
    const { nodes, gateways, incidents } = networkEngine.generateDefaultTopology({
      ...INITIAL_CONFIG,
      rangeKm: simulatedRangeKm,
      kmToPixelScale,
    });

    const initialQueues: Record<string, MeshPacket[]> = {};
    nodes.forEach(node => {
      initialQueues[node.id] = [];
    });

    const firstVictim = nodes.find(n => n.type === 'VICTIM');

    set({
      nodes,
      gateways,
      incidents,
      nodeQueues: initialQueues,
      packets: [],
      activeCitizenNodeId: firstVictim ? firstVictim.id : 'node-vic-1',
      selectedNodeId: null,
      selectedPacketId: null,
      inspectedPacket: null,
      highlightedPathNodeIds: [],
      metrics: {
        totalCreated: 0,
        totalDelivered: 0,
        totalDropped: 0,
        totalAcksDelivered: 0,
        activeInTransit: 0,
        activeQueued: 0,
        activeStored: 0,
        deliveryRate: 100,
        avgHops: 0,
        resiliencyScore: 98,
      },
    });

    get().addLog('SYSTEM', 'INFO', 'RESQ-MESH network core initialized with 36 autonomous nodes.');
    get().addLog('SYSTEM', 'SUCCESS', `Topology calibrated. Simulated LoRa communication range: ${simulatedRangeKm.toFixed(1)} km.`);
  },

  toggleSimulation: () => {
    set(state => {
      const next = !state.isRunning;
      get().addLog('SYSTEM', next ? 'INFO' : 'WARN', next ? 'Simulation Clock RESUMED' : 'Simulation Clock PAUSED');
      return { isRunning: next };
    });
  },

  setRunning: (running: boolean) => {
    set({ isRunning: running });
  },

  setRangeKm: (rangeKm: number) => {
    set({ simulatedRangeKm: rangeKm });
    const { nodes, kmToPixelScale, incidents } = get();
    networkEngine.recalculateTopologyLinks(nodes, rangeKm, kmToPixelScale, incidents);
    set({ nodes: [...nodes] });
    get().addLog('SYSTEM', 'INFO', `Simulated communication range adjusted to ${rangeKm.toFixed(1)} km`);
  },

  setTickSpeed: (speedMs: number) => {
    set({ tickSpeed: speedMs });
    get().addLog('SYSTEM', 'INFO', `Tick clock speed adjusted to ${speedMs} ms/tick`);
  },

  setWeights: (newWeights: Partial<RoutingWeights>) => {
    set(state => ({
      weights: { ...state.weights, ...newWeights },
    }));
    get().addLog('ROUTING', 'INFO', 'Multi-attribute routing heuristic weights updated');
  },

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  moveNode: (nodeId: string, x: number, y: number) => {
    const { nodes, simulatedRangeKm, kmToPixelScale, incidents } = get();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    node.x = x;
    node.y = y;

    networkEngine.recalculateTopologyLinks(nodes, simulatedRangeKm, kmToPixelScale, incidents);
    set({ nodes: [...nodes] });
  },

  selectPacket: (packetId: string | null) => {
    if (!packetId) {
      set({ selectedPacketId: null, inspectedPacket: null, highlightedPathNodeIds: [] });
      return;
    }
    const { packets } = get();
    const target = packets.find(p => p.messageId === packetId) || null;
    const pathNodeIds = target ? target.pathHistory.map(h => h.nodeId) : [];
    set({
      selectedPacketId: packetId,
      inspectedPacket: target,
      highlightedPathNodeIds: pathNodeIds,
    });
  },

  createPacket: (options: CreatePacketOptions): MeshPacket | null => {
    const { nodes, nodeQueues } = get();
    const sourceNode = nodes.find(n => n.id === options.sourceNodeId);
    if (!sourceNode) return null;

    let priority: PacketPriority = options.priority !== undefined ? options.priority : 1;
    if (options.messageType === 'SOS' || options.messageType === 'MEDICAL' || options.messageType === 'TRAPPED') {
      priority = 0;
    } else if (options.messageType === 'ACK') {
      priority = 2;
    }

    const messageId = `PKT-${options.messageType}-${(packetCounter++).toString().padStart(4, '0')}`;
    const payload = options.payload || `${options.messageType} alert from node ${sourceNode.name}`;

    const newPacket: MeshPacket = {
      messageId,
      incidentId: options.incidentId,
      sourceNodeId: sourceNode.id,
      currentNodeId: sourceNode.id,
      messageType: options.messageType,
      priority,
      latitude: 26.9124 + (sourceNode.y / 1000) * 0.05,
      longitude: 75.7873 + (sourceNode.x / 1000) * 0.05,
      timestamp: Date.now(),
      ttl: 20,
      hopCount: 0,
      retryCount: 0,
      status: 'QUEUED',
      pathHistory: [
        {
          nodeId: sourceNode.id,
          nodeName: sourceNode.name,
          timestamp: Date.now(),
          action: 'ORIGINATED',
          note: `Packet generated (Priority ${priority})`,
          batteryAtHop: sourceNode.battery,
          signalQuality: sourceNode.signalQuality,
        }
      ],
      payload,
      inTransit: false,
      transitProgress: 0,
      transitSpeed: 0.45,
      sizeBytes: options.messageType === 'SOS' ? 48 : 64,
    };

    sourceNode.totalPacketsOriginated++;

    const queue = nodeQueues[sourceNode.id] || [];
    const enqueueRes = queueEngine.enqueue(sourceNode, queue, newPacket);
    nodeQueues[sourceNode.id] = queue;

    if (enqueueRes.evictedPacket) {
      get().addLog('ROUTING', 'WARN', `Node ${sourceNode.name}: ${enqueueRes.reason}`, {
        nodeId: sourceNode.id,
        packetId: enqueueRes.evictedPacket.messageId,
      });
    }

    get().addLog(
      options.messageType === 'SOS' ? 'SOS' : 'ROUTING',
      options.messageType === 'SOS' ? 'CRITICAL' : 'INFO',
      `[${newPacket.messageId}] ${newPacket.messageType} packet created at ${sourceNode.name} (Priority: ${priority === 0 ? '0-CRITICAL' : priority === 1 ? '1-URGENT' : '2-NORMAL'})`,
      { nodeId: sourceNode.id, packetId: newPacket.messageId }
    );

    set(state => ({
      packets: [newPacket, ...state.packets].slice(0, 300),
      nodes: [...state.nodes],
      nodeQueues: { ...state.nodeQueues },
      metrics: {
        ...state.metrics,
        totalCreated: state.metrics.totalCreated + 1,
      }
    }));

    return newPacket;
  },

  injectSmsPacket: (rawSms: string): MeshPacket | null => {
    const { nodes } = get();
    let type: MessageType = 'SOS';
    const upper = rawSms.toUpperCase();
    if (upper.includes('MEDICAL')) type = 'MEDICAL';
    else if (upper.includes('TRAPPED')) type = 'TRAPPED';
    else if (upper.includes('EVACUAT')) type = 'EVACUATION';
    else if (upper.includes('WATER')) type = 'WATER';
    else if (upper.includes('FOOD')) type = 'FOOD';

    const victimNodes = nodes.filter(n => n.type === 'VICTIM' && n.status !== 'FAILED');
    const targetNode = victimNodes[Math.floor(Math.random() * victimNodes.length)] || nodes[0];

    if (!targetNode) return null;

    const packet = get().createPacket({
      sourceNodeId: targetNode.id,
      messageType: type,
      payload: `[SMS BRIDGE: "${rawSms}"]`,
    });

    get().addLog('SYSTEM', 'SUCCESS', `SMS Gateway received & encapsulated raw SMS into LoRa frame #${packet?.messageId}`);
    return packet;
  },

  toggleNodeFailure: (nodeId: string) => {
    const { nodes, simulatedRangeKm, incidents, packets } = get();
    const res = failureEngine.toggleNodeFailure(nodeId, nodes, simulatedRangeKm, incidents);
    if (!res.affectedNode) return;

    const isFailed = res.affectedNode.status === 'FAILED';
    get().addLog(
      'FAILURE',
      isFailed ? 'CRITICAL' : 'SUCCESS',
      isFailed 
        ? `Node ${res.affectedNode.name} (${nodeId}) FAULT INJECTED - Node is OFFLINE.` 
        : `Node ${res.affectedNode.name} (${nodeId}) RECOVERED - Node is ONLINE.`,
      { nodeId }
    );

    if (isFailed) {
      const rerouteRes = failureEngine.handleTopologyReroute(nodeId, packets);
      if (rerouteRes.reroutedCount > 0) {
        get().addLog('ROUTING', 'WARN', `Dynamic Rerouting: ${rerouteRes.reroutedCount} in-flight packet(s) rerouted around dead node ${nodeId}.`);
      }
    }

    set({ nodes: [...nodes], packets: [...packets] });
  },

  drainNodeBattery: (nodeId: string) => {
    const { nodes, simulatedRangeKm, incidents } = get();
    const node = failureEngine.drainBattery(nodeId, nodes, simulatedRangeKm, incidents);
    if (node) {
      get().addLog('FAILURE', 'WARN', `Battery depleted on ${node.name} (5% remaining). Power mode: POWER_SAVE.`, { nodeId });
      set({ nodes: [...nodes] });
    }
  },

  rechargeNodeBattery: (nodeId: string) => {
    const { nodes, simulatedRangeKm, incidents } = get();
    const node = failureEngine.rechargeBattery(nodeId, nodes, simulatedRangeKm, incidents);
    if (node) {
      get().addLog('SYSTEM', 'SUCCESS', `Battery fully recharged to 100% on ${node.name}.`, { nodeId });
      set({ nodes: [...nodes] });
    }
  },

  toggleGatewayStatus: (gatewayId: string) => {
    const { gateways, nodes, simulatedRangeKm, incidents } = get();
    const gw = failureEngine.toggleGatewayStatus(gatewayId, gateways, nodes, simulatedRangeKm, incidents);
    if (gw) {
      const isDown = gw.status === 'OFFLINE';
      get().addLog(
        'GATEWAY',
        isDown ? 'CRITICAL' : 'SUCCESS',
        isDown
          ? `Relief Gateway ${gw.name} is OFFLINE. Triggering mesh egress failover to alternate gateways.`
          : `Relief Gateway ${gw.name} is back ONLINE and ready for uplink egress.`,
        { nodeId: gw.nodeId }
      );
      set({ gateways: [...gateways], nodes: [...nodes] });
    }
  },

  createIncident: (incidentData) => {
    const newIncident: Incident = {
      ...incidentData,
      id: `inc-${Date.now().toString(36)}`,
      startedAt: Date.now(),
    };

    const { incidents, nodes, simulatedRangeKm, kmToPixelScale } = get();
    const updatedIncidents = [newIncident, ...incidents];
    networkEngine.recalculateTopologyLinks(nodes, simulatedRangeKm, kmToPixelScale, updatedIncidents);

    get().addLog('SYSTEM', 'CRITICAL', `DISASTER ALERT: New ${newIncident.type} (${newIncident.name}) detected. RF interference zone established.`);
    set({ incidents: updatedIncidents, nodes: [...nodes] });
  },

  toggleIncident: (incidentId: string) => {
    const { incidents, nodes, simulatedRangeKm, kmToPixelScale } = get();
    const incident = incidents.find(i => i.id === incidentId);
    if (!incident) return;

    incident.active = !incident.active;
    networkEngine.recalculateTopologyLinks(nodes, simulatedRangeKm, kmToPixelScale, incidents);

    get().addLog('SYSTEM', incident.active ? 'WARN' : 'INFO', `Disaster Zone ${incident.name} ${incident.active ? 'ACTIVATED' : 'DEACTIVATED'}.`);
    set({ incidents: [...incidents], nodes: [...nodes] });
  },

  clearIncidents: () => {
    const { nodes, simulatedRangeKm, kmToPixelScale } = get();
    networkEngine.recalculateTopologyLinks(nodes, simulatedRangeKm, kmToPixelScale, []);
    get().addLog('SYSTEM', 'INFO', 'All disaster hazard zones cleared.');
    set({ incidents: [], nodes: [...nodes] });
  },

  triggerStressTest: (packetCount: 100 | 500 | 1000) => {
    const { nodes } = get();
    const victimNodes = nodes.filter(n => n.type === 'VICTIM' && n.status !== 'FAILED');
    if (victimNodes.length === 0) return;

    get().addLog('SYSTEM', 'CRITICAL', `BURST STRESS TEST STARTED: Injecting ${packetCount} simultaneous packets across disaster cluster...`);

    const messageTypes: MessageType[] = ['FOOD', 'WATER', 'EVACUATION', 'MEDICAL'];

    for (let i = 0; i < packetCount; i++) {
      const randomVictim = victimNodes[Math.floor(Math.random() * victimNodes.length)];
      const isCritical = i === Math.floor(packetCount / 2);
      
      const type = isCritical ? 'SOS' : messageTypes[i % messageTypes.length];
      get().createPacket({
        sourceNodeId: randomVictim.id,
        messageType: type,
        payload: isCritical ? '*** CRITICAL TIER-1 LIFE HAZARD ***' : `Logistics payload #${i + 1}`,
      });
    }

    get().addLog('ROUTING', 'WARN', `Congestion engines engaged. Priority 0 SOS packets will preemptively evict normal queue traffic.`);
  },

  loadScenario: (scenarioIndex: number) => {
    const { nodes, gateways } = get();
    const victimNode = nodes.find(n => n.type === 'VICTIM') || nodes[0];
    const relayNode = nodes.find(n => n.type === 'RELAY');

    switch (scenarioIndex) {
      case 1: {
        set({
          activeScenarioId: 'scenario-1',
          scenarioStep: 1,
          scenarioDescription: 'Demonstrates end-to-end SOS transmission across multi-hop relays to relief gateway, triggering automatic reverse ACK back to victim node.',
        });
        get().addLog('SYSTEM', 'INFO', '--- SCENARIO 1 LOADED: Multi-Hop SOS Delivery & Reverse ACK ---');
        get().createPacket({
          sourceNodeId: victimNode.id,
          messageType: 'SOS',
          payload: 'SOS: Trapped under debris, 3 survivors, water required.',
        });
        break;
      }
      case 2: {
        set({
          activeScenarioId: 'scenario-2',
          scenarioStep: 1,
          scenarioDescription: 'Injects an SOS packet, waits for it to reach mid-transit, then kills the target relay node to demonstrate real-time dynamic rerouting.',
        });
        get().addLog('SYSTEM', 'INFO', '--- SCENARIO 2 LOADED: Mid-Transit Node Failure & Automatic Reroute ---');
        get().createPacket({
          sourceNodeId: victimNode.id,
          messageType: 'TRAPPED',
          payload: 'URGENT: Flash flood surging. Need air extraction.',
        });
        setTimeout(() => {
          if (relayNode) {
            get().toggleNodeFailure(relayNode.id);
            get().addLog('FAILURE', 'CRITICAL', `[SCENARIO EVENT] Relay node ${relayNode.name} power failure simulated! Routing engine dynamically adapting path.`);
          }
        }, 1200);
        break;
      }
      case 3: {
        set({
          activeScenarioId: 'scenario-3',
          scenarioStep: 1,
          scenarioDescription: 'Floods the mesh network with 200 normal priority packets to fill queues to 100%, then generates 1 Critical SOS (Priority 0) demonstrating priority preemption.',
        });
        get().addLog('SYSTEM', 'INFO', '--- SCENARIO 3 LOADED: Congestion Control & Priority Preemption ---');
        for (let i = 0; i < 40; i++) {
          get().createPacket({
            sourceNodeId: victimNode.id,
            messageType: 'FOOD',
            priority: 2,
            payload: `Background food telemetry ${i}`,
          });
        }
        setTimeout(() => {
          get().createPacket({
            sourceNodeId: victimNode.id,
            messageType: 'SOS',
            priority: 0,
            payload: 'CRITICAL PRIORITY 0: Child in cardiac arrest!',
          });
        }, 500);
        break;
      }
      case 4: {
        set({
          activeScenarioId: 'scenario-4',
          scenarioStep: 1,
          scenarioDescription: 'Drains battery of primary corridor relay nodes to 5%, demonstrating how heuristic weights W3 automatically steer packets along healthier nodes.',
        });
        get().addLog('SYSTEM', 'INFO', '--- SCENARIO 4 LOADED: Low Battery Avoidance Routing ---');
        if (relayNode) {
          get().drainNodeBattery(relayNode.id);
        }
        get().createPacket({
          sourceNodeId: victimNode.id,
          messageType: 'MEDICAL',
          payload: 'Medical supply requisition - insulin needed.',
        });
        break;
      }
      case 5: {
        set({
          activeScenarioId: 'scenario-5',
          scenarioStep: 1,
          scenarioDescription: 'Simulates network partition: drops range to isolate victim cluster, shows packets entering STORED buffer, then restores range to show packet forwarding resumption.',
        });
        get().addLog('SYSTEM', 'INFO', '--- SCENARIO 5 LOADED: Store-and-Forward Network Partition Recovery ---');
        get().setRangeKm(2.0);
        get().createPacket({
          sourceNodeId: victimNode.id,
          messageType: 'SOS',
          payload: 'Partitioned victim node SOS. Storing in non-volatile buffer until link recovery.',
        });
        setTimeout(() => {
          get().addLog('SYSTEM', 'SUCCESS', '[SCENARIO EVENT] Link connectivity restored! Simulated range returned to 5.0 km.');
          get().setRangeKm(5.0);
        }, 4000);
        break;
      }
      case 6: {
        set({
          activeScenarioId: 'scenario-6',
          scenarioStep: 1,
          scenarioDescription: 'Simulates primary SatCom gateway failure; active packets dynamically discover and reroute towards backup LTE/Drone gateway.',
        });
        get().addLog('SYSTEM', 'INFO', '--- SCENARIO 6 LOADED: Gateway Failure & Failover ---');
        if (gateways.length > 0) {
          get().toggleGatewayStatus(gateways[0].id);
        }
        get().createPacket({
          sourceNodeId: victimNode.id,
          messageType: 'EVACUATION',
          payload: 'Sector evacuation request. Egress handoff to backup gateway.',
        });
        break;
      }
      default:
        break;
    }
  },

  resetSimulation: () => {
    packetCounter = 1;
    ticketCounter = 1;
    msgCounter = 1;
    get().init();
    get().addLog('SYSTEM', 'INFO', 'Simulation reset to baseline state.');
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  stepSimulation: () => {
    const state = get();
    const { nodes, gateways, incidents, nodeQueues, packets, citizenTickets, simulatedRangeKm, kmToPixelScale, weights } = state;
    const maxRangePixels = networkEngine.rangeKmToPixels(simulatedRangeKm, kmToPixelScale);
    const nodesMap = new Map(nodes.map(n => [n.id, n]));

    let totalDelivered = state.metrics.totalDelivered;
    let totalDropped = state.metrics.totalDropped;
    let totalAcksDelivered = state.metrics.totalAcksDelivered;
    let activeInTransitCount = 0;
    let activeQueuedCount = 0;
    let activeStoredCount = 0;

    const newPacketsToSpawn: MeshPacket[] = [];
    const updatedPackets = [...packets];
    const updatedTickets = [...citizenTickets];

    const updateTicketForPacket = (pkt: MeshPacket, status: CitizenSosTicket['status'], note: string, ackId?: string) => {
      const ticket = updatedTickets.find(t => t.packetId === pkt.messageId || t.ackPacketId === pkt.messageId || (pkt.originalPacketId && t.packetId === pkt.originalPacketId));
      if (ticket) {
        if (ticket.status !== 'RESCUE_DISPATCHED' && ticket.status !== 'RESOLVED') {
          ticket.status = status;
        }
        ticket.hopProgress = Math.max(ticket.hopProgress, pkt.hopCount);
        if (ticket.status !== 'RESCUE_DISPATCHED' && ticket.status !== 'RESOLVED') {
          ticket.lastUpdateMessage = note;
        }
        if (ackId) ticket.ackPacketId = ackId;
      }
    };

    // PHASE 1: Advance In-Transit Packet Physics & Hop Transitions
    for (const packet of updatedPackets) {
      if (packet.status === 'DELIVERED' || packet.status === 'FAILED' || packet.status === 'EXPIRED') {
        continue;
      }

      if (packet.inTransit) {
        packet.transitProgress += packet.transitSpeed;

        if (packet.transitProgress >= 1.0) {
          packet.inTransit = false;
          packet.transitProgress = 0;
          const targetNode = nodesMap.get(packet.nextHopId!);

          if (!targetNode || targetNode.status === 'FAILED' || targetNode.status === 'OFFLINE') {
            packet.status = 'FAILED';
            packet.failureReason = `TARGET_HOP_${packet.nextHopId}_DIED_MID_FLIGHT`;
            totalDropped++;
            updateTicketForPacket(packet, 'ROUTING', `Relay node ${packet.nextHopId} collapsed. Mesh dynamically attempting alternate route...`);
            get().addLog('FAILURE', 'CRITICAL', `[${packet.messageId}] Mid-flight drop: Target node ${packet.nextHopId} collapsed.`, {
              packetId: packet.messageId,
              nodeId: packet.nextHopId
            });
            continue;
          }

          packet.previousNodeId = packet.currentNodeId;
          packet.currentNodeId = targetNode.id;
          packet.nextHopId = undefined;
          packet.ttl--;
          packet.hopCount++;
          targetNode.totalPacketsForwarded++;

          updateTicketForPacket(packet, 'ROUTING', `Traversing mesh relay #${packet.hopCount} (${targetNode.name}). Signal quality: ${targetNode.signalQuality}%`);

          if (!targetNode.recentPacketIds.includes(packet.messageId)) {
            targetNode.recentPacketIds.push(packet.messageId);
            if (targetNode.recentPacketIds.length > 20) targetNode.recentPacketIds.shift();
          }

          if (packet.ttl <= 0) {
            packet.status = 'EXPIRED';
            packet.failureReason = 'TTL_EXPIRED';
            totalDropped++;
            targetNode.totalPacketsDropped++;
            packet.pathHistory.push({
              nodeId: targetNode.id,
              nodeName: targetNode.name,
              timestamp: Date.now(),
              action: 'DROPPED',
              note: 'Hop limit exceeded (TTL 0)',
              batteryAtHop: targetNode.battery,
            });
            get().addLog('ROUTING', 'WARN', `[${packet.messageId}] Expired: TTL depleted at ${targetNode.name}`, {
              nodeId: targetNode.id,
              packetId: packet.messageId
            });
            continue;
          }

          if (targetNode.type === 'GATEWAY' && !packet.isAck) {
            packet.status = 'DELIVERED';
            packet.deliveredAt = Date.now();
            totalDelivered++;
            
            const gw = gateways.find(g => g.nodeId === targetNode.id);
            if (gw) {
              gw.totalPacketsDelivered++;
              if (packet.messageType === 'SOS') gw.totalSosDelivered++;
            }

            updateTicketForPacket(
              packet, 
              'GATEWAY_DELIVERED', 
              `Received by ${targetNode.name}! Cloud uplink connected. Emergency dispatch teams alerted.`
            );

            packet.pathHistory.push({
              nodeId: targetNode.id,
              nodeName: targetNode.name,
              timestamp: Date.now(),
              action: 'DELIVERED',
              note: `Egress Relief Gateway reached via ${packet.hopCount} hops`,
              batteryAtHop: targetNode.battery,
            });

            get().addLog(
              'GATEWAY',
              'SUCCESS',
              `[DELIVERED] ${packet.messageType} #${packet.messageId} reached Gateway ${targetNode.name} in ${packet.hopCount} hops! Dispatched to emergency cloud uplink.`,
              { nodeId: targetNode.id, packetId: packet.messageId }
            );

            const ackPacket = routingEngine.generateAckPacket(packet, targetNode);
            newPacketsToSpawn.push(ackPacket);

            updateTicketForPacket(packet, 'GATEWAY_DELIVERED', `Relief Gateway confirmed reception! Reverse ACK dispatched to your device.`, ackPacket.messageId);

            get().addLog(
              'ACK',
              'INFO',
              `[REVERSE ACK] Relief Gateway dispatched ACK #${ackPacket.messageId} back to source ${packet.sourceNodeId}`,
              { nodeId: targetNode.id, packetId: ackPacket.messageId }
            );
          } else if (packet.isAck && packet.currentNodeId === packet.sourceNodeId) {
            packet.status = 'DELIVERED';
            packet.deliveredAt = Date.now();
            totalAcksDelivered++;

            updateTicketForPacket(
              packet,
              'RESCUE_DISPATCHED',
              `RESCUE CONFIRMED! Relief command has received your exact coordinates and dispatched rescue teams. Stay safe.`
            );

            packet.pathHistory.push({
              nodeId: targetNode.id,
              nodeName: targetNode.name,
              timestamp: Date.now(),
              action: 'DELIVERED',
              note: 'Reverse ACK received by victim origin!',
              batteryAtHop: targetNode.battery,
            });

            get().addLog(
              'ACK',
              'SUCCESS',
              `[ACK CONFIRMED] Origin node ${targetNode.name} received rescue confirmation ACK for SOS #${packet.originalPacketId}!`,
              { nodeId: targetNode.id, packetId: packet.messageId }
            );
          } else {
            const q = nodeQueues[targetNode.id] || [];
            const enqRes = queueEngine.enqueue(targetNode, q, packet);
            nodeQueues[targetNode.id] = q;

            if (!enqRes.accepted) {
              totalDropped++;
              get().addLog('ROUTING', 'WARN', `[${packet.messageId}] Dropped at ${targetNode.name}: ${enqRes.reason}`, {
                nodeId: targetNode.id,
                packetId: packet.messageId
              });
            } else {
              packet.status = 'QUEUED';
              if (enqRes.evictedPacket) {
                totalDropped++;
                get().addLog('ROUTING', 'WARN', `[${packet.messageId}] Preemption: ${enqRes.reason}`, {
                  nodeId: targetNode.id,
                  packetId: enqRes.evictedPacket.messageId
                });
              }
            }
          }
        } else {
          activeInTransitCount++;
        }
      }
    }

    for (const ack of newPacketsToSpawn) {
      updatedPackets.unshift(ack);
      const gwNode = nodesMap.get(ack.currentNodeId);
      if (gwNode) {
        const q = nodeQueues[gwNode.id] || [];
        queueEngine.enqueue(gwNode, q, ack);
        nodeQueues[gwNode.id] = q;
      }
    }

    // PHASE 2: Dispatch Next Hop from Node Queues
    for (const node of nodes) {
      if (node.status === 'FAILED' || node.status === 'OFFLINE') continue;

      const q = nodeQueues[node.id] || [];
      if (q.length === 0) continue;

      const packetToDispatch = queueEngine.peekNextPacket(q);
      if (!packetToDispatch || packetToDispatch.inTransit) continue;

      const { nextHopNode, scoreDetails, reason } = routingEngine.selectNextHop(
        packetToDispatch,
        node,
        gateways,
        nodesMap,
        maxRangePixels,
        incidents,
        weights
      );

      if (nextHopNode) {
        const txResult = transport.send(packetToDispatch, node, nextHopNode, maxRangePixels, incidents);

        if (txResult.success) {
          queueEngine.dequeue(node, q);
          nodeQueues[node.id] = q;

          packetToDispatch.status = 'FORWARDING';
          packetToDispatch.inTransit = true;
          packetToDispatch.transitProgress = 0;
          packetToDispatch.nextHopId = nextHopNode.id;

          node.battery = Math.max(0, +(node.battery - (packetToDispatch.priority === 0 ? 0.15 : 0.08)).toFixed(2));
          if (node.battery < 20 && node.status === 'HEALTHY') {
            node.status = 'LOW_BATTERY';
            node.powerMode = 'POWER_SAVE';
          }

          packetToDispatch.pathHistory.push({
            nodeId: nextHopNode.id,
            nodeName: nextHopNode.name,
            timestamp: Date.now(),
            action: 'FORWARDED',
            note: `Hop via ${nextHopNode.name} (SNR: ${txResult.snr}dB, RSSI: ${txResult.rssi}dBm, Score: ${scoreDetails ? scoreDetails.totalScore.toFixed(1) : 'Direct'})`,
            batteryAtHop: node.battery,
            signalQuality: Math.round(scoreDetails?.linkScore ? scoreDetails.linkScore * 100 : 90),
          });

          activeInTransitCount++;
        } else {
          packetToDispatch.retryCount++;
          if (packetToDispatch.retryCount > 3) {
            queueEngine.dequeue(node, q);
            packetToDispatch.status = 'FAILED';
            packetToDispatch.failureReason = `TX_FAIL_${txResult.lossReason}`;
            totalDropped++;
            get().addLog('FAILURE', 'WARN', `[${packetToDispatch.messageId}] Radio TX failed from ${node.name} to ${nextHopNode.name}: ${txResult.lossReason}`, {
              nodeId: node.id,
              packetId: packetToDispatch.messageId
            });
          }
        }
      } else {
        if (packetToDispatch.status !== 'STORED') {
          queueEngine.storePacket(node, packetToDispatch, reason || 'No candidate neighbor with forward score');
          activeStoredCount++;
          get().addLog('STORE_FORWARD', 'WARN', `[${packetToDispatch.messageId}] Store-and-Forward: Retaining in node ${node.name} local cache (${reason})`, {
            nodeId: node.id,
            packetId: packetToDispatch.messageId
          });
        }
      }
    }

    // PHASE 3: Metrics & State Synchronization
    let totalHopsSum = 0;
    let deliveredCount = 0;
    updatedPackets.forEach(p => {
      if (p.status === 'DELIVERED') {
        deliveredCount++;
        totalHopsSum += p.hopCount;
      }
      if (p.status === 'QUEUED') activeQueuedCount++;
      if (p.status === 'STORED') activeStoredCount++;
    });

    const totalCreated = state.metrics.totalCreated + newPacketsToSpawn.length;
    const completedPackets = totalDelivered + totalDropped;
    const deliveryRate = completedPackets > 0 
      ? Math.round((totalDelivered / completedPackets) * 100) 
      : 100;
    const avgHops = deliveredCount > 0 
      ? +(totalHopsSum / deliveredCount).toFixed(1) 
      : 0;

    const healthyNodesCount = nodes.filter(n => n.status === 'HEALTHY' || n.status === 'LOW_BATTERY').length;
    const nodeUptimeRatio = healthyNodesCount / nodes.length;
    const avgBattery = nodes.reduce((acc, n) => acc + n.battery, 0) / nodes.length;
    const resiliencyScore = Math.round(
      (deliveryRate * 0.5) + (nodeUptimeRatio * 30) + ((avgBattery / 100) * 20)
    );

    const inspected = state.selectedPacketId 
      ? updatedPackets.find(p => p.messageId === state.selectedPacketId) || null 
      : null;

    set({
      nodes: [...nodes],
      gateways: [...gateways],
      nodeQueues: { ...nodeQueues },
      packets: updatedPackets.slice(0, 300),
      citizenTickets: updatedTickets,
      inspectedPacket: inspected,
      metrics: {
        totalCreated,
        totalDelivered,
        totalDropped,
        totalAcksDelivered,
        activeInTransit: activeInTransitCount,
        activeQueued: activeQueuedCount,
        activeStored: activeStoredCount,
        deliveryRate,
        avgHops,
        resiliencyScore,
      }
    });
  },
}));
