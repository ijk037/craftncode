import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useMeshStore } from '../store/useMeshStore';
import type { MeshNode } from '../models/Node';
import type { MeshGateway } from '../models/Gateway';
import type { Incident } from '../models/Incident';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface NetworkMapProps {
  onNodeSelect?: (node: MeshNode | null) => void;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({ onNodeSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Store state
  const nodes = useMeshStore(state => state.nodes);
  const gateways = useMeshStore(state => state.gateways);
  const incidents = useMeshStore(state => state.incidents);
  const packets = useMeshStore(state => state.packets);
  const citizenTickets = useMeshStore(state => state.citizenTickets);
  const simulatedRangeKm = useMeshStore(state => state.simulatedRangeKm);
  const kmToPixelScale = useMeshStore(state => state.kmToPixelScale);
  const selectedNodeId = useMeshStore(state => state.selectedNodeId);
  const highlightedPathNodeIds = useMeshStore(state => state.highlightedPathNodeIds);

  // Actions
  const selectNode = useMeshStore(state => state.selectNode);
  const moveNode = useMeshStore(state => state.moveNode);

  // Canvas Viewport Transformation
  const [zoom, setZoom] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<MeshNode | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouseStart, setMouseStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map Display Layers
  const [showLinks, setShowLinks] = useState<boolean>(true);
  const [showRadii, setShowRadii] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showQueueBadges] = useState<boolean>(true);

  // Animation pulse phase
  const animPhaseRef = useRef<number>(0);

  // Convert Screen Coordinates to World Coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clickX = screenX - rect.left;
    const clickY = screenY - rect.top;
    const worldX = (clickX - panOffset.x) / zoom;
    const worldY = (clickY - panOffset.y) / zoom;
    return { x: worldX, y: worldY };
  }, [panOffset, zoom]);

  // Main Render Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      animPhaseRef.current = (animPhaseRef.current + 0.04) % (Math.PI * 2);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Background: Deep Charcoal
      ctx.fillStyle = '#171A19';
      ctx.fillRect(0, 0, width, height);

      ctx.translate(panOffset.x, panOffset.y);
      ctx.scale(zoom, zoom);

      drawGrid(ctx, width * 2, height * 2);

      const maxRangePixels = simulatedRangeKm * kmToPixelScale;
      const nodesMap = new Map(nodes.map(n => [n.id, n]));

      // Map citizen tickets to origin nodes
      const citizenOriginNodeMap = new Map<string, string>();
      citizenTickets.forEach(ticket => {
        const pkt = packets.find(p => p.messageId === ticket.packetId);
        if (pkt) {
          citizenOriginNodeMap.set(pkt.sourceNodeId, ticket.ticketId);
        }
      });

      // 1. Draw Disaster Incident Hazard Zones
      if (showIncidents) {
        incidents.forEach(inc => {
          if (!inc.active) return;
          drawIncidentZone(ctx, inc, animPhaseRef.current);
        });
      }

      // 2. Draw Transmission Radii & Gateway Coverage
      if (showRadii) {
        if (selectedNodeId) {
          const selNode = nodesMap.get(selectedNodeId);
          if (selNode) {
            ctx.beginPath();
            ctx.arc(selNode.x, selNode.y, maxRangePixels, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(135, 155, 84, 0.08)'; // Operational Olive
            ctx.fill();
            ctx.strokeStyle = 'rgba(135, 155, 84, 0.5)';
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        gateways.forEach(gw => {
          if (gw.status === 'OFFLINE') return;
          ctx.beginPath();
          ctx.arc(gw.x, gw.y, maxRangePixels * 1.1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(63, 143, 120, 0.04)'; // Teal Green
          ctx.fill();
          ctx.strokeStyle = 'rgba(63, 143, 120, 0.3)';
          ctx.setLineDash([6, 6]);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }

      // 3. Draw Wireless Peer Links
      if (showLinks) {
        const drawnLinks = new Set<string>();

        nodes.forEach(nodeA => {
          if (nodeA.status === 'FAILED' || nodeA.status === 'OFFLINE') return;

          nodeA.neighbours.forEach(nbrId => {
            const nodeB = nodesMap.get(nbrId);
            if (!nodeB || nodeB.status === 'FAILED' || nodeB.status === 'OFFLINE') return;

            const linkKey = [nodeA.id, nodeB.id].sort().join('--');
            if (drawnLinks.has(linkKey)) return;
            drawnLinks.add(linkKey);

            const isHighlightedPath =
              highlightedPathNodeIds.includes(nodeA.id) &&
              highlightedPathNodeIds.includes(nodeB.id);

            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const qualityRatio = Math.max(0.1, 1 - dist / maxRangePixels);

            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);

            if (isHighlightedPath) {
              ctx.strokeStyle = '#879B54'; // Operational Olive
              ctx.lineWidth = 3.5;
              ctx.shadowColor = '#879B54';
              ctx.shadowBlur = 12;
              ctx.stroke();
              ctx.shadowBlur = 0;
            } else {
              if (qualityRatio > 0.6) {
                ctx.strokeStyle = `rgba(63, 143, 120, ${0.2 + qualityRatio * 0.3})`; // Teal Green
              } else if (qualityRatio > 0.3) {
                ctx.strokeStyle = `rgba(212, 154, 58, ${0.2 + qualityRatio * 0.3})`; // Amber
              } else {
                ctx.strokeStyle = `rgba(184, 74, 58, ${0.15 + qualityRatio * 0.25})`; // Rust Red
              }
              ctx.lineWidth = Math.max(0.8, qualityRatio * 2);
              ctx.stroke();
            }
          });
        });
      }

      // 4. Draw In-Flight Packets & Hop Trails
      packets.forEach(pkt => {
        if (!pkt.inTransit || !pkt.nextHopId) return;
        const fromNode = nodesMap.get(pkt.currentNodeId);
        const toNode = nodesMap.get(pkt.nextHopId);
        if (!fromNode || !toNode) return;

        const currentX = fromNode.x + (toNode.x - fromNode.x) * pkt.transitProgress;
        const currentY = fromNode.y + (toNode.y - fromNode.y) * pkt.transitProgress;

        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = pkt.priority === 0 
          ? 'rgba(184, 74, 58, 0.8)' 
          : pkt.isAck 
            ? 'rgba(63, 143, 120, 0.8)' 
            : 'rgba(135, 155, 84, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        const orbRadius = pkt.priority === 0 ? 6 : 4.5;
        ctx.arc(currentX, currentY, orbRadius, 0, Math.PI * 2);
        
        if (pkt.priority === 0) {
          ctx.fillStyle = '#B84A3A'; // Rust Red
          ctx.shadowColor = '#B84A3A';
        } else if (pkt.isAck) {
          ctx.fillStyle = '#3F8F78'; // Teal Green
          ctx.shadowColor = '#3F8F78';
        } else {
          ctx.fillStyle = '#879B54'; // Operational Olive
          ctx.shadowColor = '#879B54';
        }
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillStyle = '#E8E6DE';
        ctx.fillText(pkt.messageType, currentX + 8, currentY - 6);
      });

      // 5. Draw Mesh Nodes
      nodes.forEach(node => {
        const isSelected = node.id === selectedNodeId;
        const isHighlighted = highlightedPathNodeIds.includes(node.id);
        const citizenTicketId = citizenOriginNodeMap.get(node.id);
        drawNode(ctx, node, isSelected, isHighlighted, showLabels, showQueueBadges, animPhaseRef.current, citizenTicketId);
      });

      // 6. Draw Gateway Uplinks
      gateways.forEach(gw => {
        if (gw.status === 'OFFLINE') return;
        drawGatewayUplink(ctx, gw, animPhaseRef.current);
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    nodes,
    gateways,
    incidents,
    packets,
    citizenTickets,
    simulatedRangeKm,
    kmToPixelScale,
    selectedNodeId,
    highlightedPathNodeIds,
    panOffset,
    zoom,
    showLinks,
    showRadii,
    showIncidents,
    showLabels,
    showQueueBadges,
  ]);

  // Helper: Draw 2D Background Grid & India Sector Markings
  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = '#202624';
    ctx.lineWidth = 1;
    const step = 60;

    for (let x = -w; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, -h);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    for (let y = -h; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(-w, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // India Sector Military Topography Watermark
    ctx.save();
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(135, 155, 84, 0.12)'; // Operational Olive subtle watermark
    ctx.fillText('🇮🇳 DISASTER RELIEF GRID • SECTOR 01 (RAJASTHAN CORRIDOR)', 40, 50);
    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(156, 166, 160, 0.12)';
    ctx.fillText('BASE GPS FIX: 26.9124° N, 75.7873° E • HARDWARE RADIO MESH (0 KB INTERNET)', 40, 68);
    ctx.restore();
  };

  // Helper: Draw Hazard Zones
  const drawIncidentZone = (ctx: CanvasRenderingContext2D, inc: Incident, phase: number) => {
    const pulse = Math.sin(phase) * 6;
    const currentRadius = inc.radius + pulse;

    const grad = ctx.createRadialGradient(
      inc.epicenterX, inc.epicenterY, 0,
      inc.epicenterX, inc.epicenterY, currentRadius
    );

    if (inc.type === 'EARTHQUAKE') {
      grad.addColorStop(0, 'rgba(184, 74, 58, 0.35)'); // Rust Red
      grad.addColorStop(0.7, 'rgba(184, 74, 58, 0.1)');
      grad.addColorStop(1, 'rgba(184, 74, 58, 0)');
      ctx.strokeStyle = 'rgba(184, 74, 58, 0.6)';
    } else if (inc.type === 'FLOOD') {
      grad.addColorStop(0, 'rgba(63, 143, 120, 0.35)'); // Teal Green
      grad.addColorStop(0.7, 'rgba(63, 143, 120, 0.1)');
      grad.addColorStop(1, 'rgba(63, 143, 120, 0)');
      ctx.strokeStyle = 'rgba(63, 143, 120, 0.6)';
    } else {
      grad.addColorStop(0, 'rgba(212, 154, 58, 0.35)'); // Amber
      grad.addColorStop(0.7, 'rgba(212, 154, 58, 0.1)');
      grad.addColorStop(1, 'rgba(212, 154, 58, 0)');
      ctx.strokeStyle = 'rgba(212, 154, 58, 0.6)';
    }

    ctx.beginPath();
    ctx.arc(inc.epicenterX, inc.epicenterY, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#D49A3A';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚠ ${inc.name}`, inc.epicenterX, inc.epicenterY - currentRadius - 8);
    ctx.font = '500 9px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(232, 230, 222, 0.7)';
    ctx.fillText(`RF Attenuation: ${(inc.rfInterferenceFactor * 100).toFixed(0)}%`, inc.epicenterX, inc.epicenterY - currentRadius + 6);
  };

  // Helper: Draw Mesh Node
  const drawNode = (
    ctx: CanvasRenderingContext2D,
    node: MeshNode,
    isSelected: boolean,
    isHighlighted: boolean,
    drawLabels: boolean,
    drawQueue: boolean,
    phase: number,
    citizenTicketId?: string
  ) => {
    let nodeRadius = 9;
    let nodeColor = '#3F8F78'; // Teal Green (Healthy)

    if (node.status === 'FAILED' || node.status === 'OFFLINE') {
      nodeColor = '#B84A3A'; // Rust Red
    } else if (node.status === 'LOW_BATTERY' || node.battery < 20) {
      nodeColor = '#D49A3A'; // Amber
    } else if (node.status === 'CONGESTED') {
      nodeColor = '#D49A3A'; // Amber
    }

    if (node.type === 'GATEWAY') {
      nodeRadius = 13;
      nodeColor = node.status === 'FAILED' ? '#B84A3A' : '#879B54'; // Olive
    } else if (node.type === 'COMMAND') {
      nodeRadius = 12;
      nodeColor = '#E8E6DE'; // Off-White
    } else if (node.type === 'VICTIM') {
      nodeRadius = 10;
      nodeColor = node.status === 'FAILED' ? '#B84A3A' : '#D49A3A'; // Amber / Rust Red
    }

    // Selection ring
    if (isSelected || isHighlighted) {
      ctx.beginPath();
      const ringRadius = nodeRadius + 8 + Math.sin(phase * 2) * 3;
      ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isSelected ? '#879B54' : '#3F8F78';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = isSelected ? '#879B54' : '#3F8F78';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Victim Pulse
    if (node.type === 'VICTIM' && node.status !== 'FAILED') {
      const pulseSize = (Math.sin(phase * 3) + 1) * 8;
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius + pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = citizenTicketId ? 'rgba(184, 74, 58, 0.8)' : 'rgba(212, 154, 58, 0.4)';
      ctx.lineWidth = citizenTicketId ? 2.5 : 1.5;
      ctx.stroke();
    }

    // Battery Arc Ring
    const batteryRatio = node.battery / 100;
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius + 3.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * batteryRatio);
    ctx.strokeStyle = node.battery > 50 ? '#3F8F78' : node.battery > 20 ? '#D49A3A' : '#B84A3A';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Node Body
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = nodeColor;
    ctx.fill();
    ctx.strokeStyle = '#171A19';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label / Icon inside node
    ctx.fillStyle = node.type === 'COMMAND' ? '#171A19' : '#E8E6DE';
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const symbol = node.type === 'GATEWAY' ? 'GW' : node.type === 'COMMAND' ? 'HQ' : node.type === 'VICTIM' ? 'V' : 'R';
    ctx.fillText(symbol, node.x, node.y);

    // Queue Badge
    if (drawQueue && node.queueSize > 0) {
      const badgeX = node.x + nodeRadius + 2;
      const badgeY = node.y - nodeRadius - 2;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = node.queueSize > 25 ? '#B84A3A' : '#879B54';
      ctx.fill();
      ctx.strokeStyle = '#171A19';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#E8E6DE';
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.fillText(node.queueSize.toString(), badgeX, badgeY);
    }

    // Citizen Ticket Flag Beacon
    if (citizenTicketId) {
      ctx.fillStyle = '#B84A3A';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`🚨 #${citizenTicketId}`, node.x, node.y - nodeRadius - 8);
    }

    // Name Label
    if (drawLabels) {
      ctx.font = '500 10px Inter, sans-serif';
      ctx.fillStyle = '#9CA6A0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.name, node.x, node.y + nodeRadius + 6);
    }
  };

  // Helper: Draw Gateway Uplink Beam
  const drawGatewayUplink = (ctx: CanvasRenderingContext2D, gw: MeshGateway, phase: number) => {
    const beamAlpha = (Math.sin(phase * 2) + 1) * 0.15 + 0.1;
    const grad = ctx.createLinearGradient(gw.x, gw.y, gw.x, gw.y - 50);
    grad.addColorStop(0, `rgba(135, 155, 84, ${beamAlpha})`);
    grad.addColorStop(1, 'rgba(135, 155, 84, 0)');

    ctx.beginPath();
    ctx.moveTo(gw.x - 12, gw.y);
    ctx.lineTo(gw.x + 12, gw.y);
    ctx.lineTo(gw.x + 4, gw.y - 45);
    ctx.lineTo(gw.x - 4, gw.y - 45);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  };

  // Mouse Handlers for Pan, Zoom & Node Drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    const clickedNode = nodes.find(n => {
      const dx = n.x - worldPos.x;
      const dy = n.y - worldPos.y;
      return Math.sqrt(dx * dx + dy * dy) <= 16;
    });

    if (clickedNode) {
      setDraggedNodeId(clickedNode.id);
      selectNode(clickedNode.id);
      if (onNodeSelect) onNodeSelect(clickedNode);
    } else {
      setIsPanning(true);
      setMouseStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeId) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      moveNode(draggedNodeId, worldPos.x, worldPos.y);
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - mouseStart.x,
        y: e.clientY - mouseStart.y,
      });
    } else {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const hovered = nodes.find(n => {
        const dx = n.x - worldPos.x;
        const dy = n.y - worldPos.y;
        return Math.sqrt(dx * dx + dy * dy) <= 14;
      }) || null;

      setHoveredNode(hovered);
      setHoverPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(2.5, Math.max(0.4, prev * zoomFactor)));
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#171A19] border border-[#333b37] rounded-xl shadow-2xl select-none font-sans">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Floating Map Controls Toolbar */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#242927]/90 backdrop-blur-md p-1 rounded-xl border border-[#333b37] shadow-xl text-xs">
        <button
          onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
          className="p-1.5 hover:bg-[#171A19] text-[#E8E6DE] rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-[#879B54]" />
        </button>

        <button
          onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
          className="p-1.5 hover:bg-[#171A19] text-[#E8E6DE] rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-[#879B54]" />
        </button>

        <button
          onClick={() => {
            setZoom(1.0);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="p-1.5 hover:bg-[#171A19] text-[#E8E6DE] rounded-lg transition-colors"
          title="Reset Viewport"
        >
          <RotateCcw className="w-4 h-4 text-[#9CA6A0]" />
        </button>

        <div className="h-4 w-px bg-[#333b37] mx-1" />

        <button
          onClick={() => setShowLinks(v => !v)}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
            showLinks ? 'bg-[#3F8F78]/20 text-[#3F8F78] border border-[#3F8F78]/40' : 'text-[#9CA6A0]'
          }`}
        >
          Links
        </button>

        <button
          onClick={() => setShowRadii(v => !v)}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
            showRadii ? 'bg-[#879B54]/20 text-[#879B54] border border-[#879B54]/40' : 'text-[#9CA6A0]'
          }`}
        >
          Radii
        </button>

        <button
          onClick={() => setShowIncidents(v => !v)}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
            showIncidents ? 'bg-[#D49A3A]/20 text-[#D49A3A] border border-[#D49A3A]/40' : 'text-[#9CA6A0]'
          }`}
        >
          Hazards
        </button>

        <button
          onClick={() => setShowLabels(v => !v)}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
            showLabels ? 'bg-[#242927] text-[#E8E6DE] border border-[#333b37]' : 'text-[#9CA6A0]'
          }`}
        >
          Labels
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-[#242927]/90 backdrop-blur-md p-2.5 rounded-xl border border-[#333b37] text-[11px] text-[#9CA6A0] shadow-xl flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3F8F78]" />
          <span className="text-[#E8E6DE]">Relay (Healthy)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#879B54]" />
          <span className="text-[#E8E6DE]">Gateway / HQ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D49A3A]" />
          <span className="text-[#E8E6DE]">Victim / Low Batt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B84A3A]" />
          <span className="text-[#E8E6DE]">Failed / Offline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#879B54]" />
          <span className="text-[#879B54] font-bold">Active Route</span>
        </div>
      </div>

      {/* Hover Node Tooltip */}
      {hoveredNode && (
        <div
          className="fixed pointer-events-none z-50 bg-[#242927] border border-[#879B54]/40 rounded-xl p-2.5 text-xs shadow-2xl text-[#E8E6DE] font-mono space-y-1 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoverPos.x, top: hoverPos.y }}
        >
          <div className="font-bold flex items-center justify-between gap-3 text-sm">
            <span className="text-[#879B54]">{hoveredNode.name}</span>
            <span className="text-[10px] text-[#9CA6A0]">[{hoveredNode.type}]</span>
          </div>
          <div className="text-[11px] text-[#9CA6A0] space-y-0.5">
            <div>Status: <span className={hoveredNode.status === 'HEALTHY' ? 'text-[#3F8F78]' : 'text-[#D49A3A]'}>{hoveredNode.status}</span></div>
            <div>Battery: <span className="text-[#E8E6DE]">{hoveredNode.battery.toFixed(0)}%</span></div>
            <div>Queue: <span className="text-[#E8E6DE]">{hoveredNode.queueSize}/{hoveredNode.maxQueueSize}</span></div>
            <div>Peers in range: <span className="text-[#879B54]">{hoveredNode.neighbours.length}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
