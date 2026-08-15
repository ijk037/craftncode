import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useMeshStore } from '../store/useMeshStore';
import type { MeshNode } from '../models/Node';
import type { MeshGateway } from '../models/Gateway';
import type { Incident } from '../models/Incident';
import { Radio, ZoomIn, ZoomOut, RotateCcw, Eye, ShieldAlert, Wifi, BatteryCharging } from 'lucide-react';

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

      ctx.fillStyle = '#0a0f1d';
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

      if (showIncidents) {
        incidents.forEach(inc => {
          if (!inc.active) return;
          drawIncidentZone(ctx, inc, animPhaseRef.current);
        });
      }

      if (showRadii) {
        if (selectedNodeId) {
          const selNode = nodesMap.get(selectedNodeId);
          if (selNode) {
            ctx.beginPath();
            ctx.arc(selNode.x, selNode.y, maxRangePixels, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(6, 182, 212, 0.05)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
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
          ctx.fillStyle = 'rgba(139, 92, 246, 0.03)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
          ctx.setLineDash([6, 6]);
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }

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
              ctx.strokeStyle = '#06b6d4';
              ctx.lineWidth = 3;
              ctx.shadowColor = '#06b6d4';
              ctx.shadowBlur = 10;
              ctx.stroke();
              ctx.shadowBlur = 0;
            } else {
              if (qualityRatio > 0.6) {
                ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 + qualityRatio * 0.25})`;
              } else if (qualityRatio > 0.3) {
                ctx.strokeStyle = `rgba(245, 158, 11, ${0.15 + qualityRatio * 0.25})`;
              } else {
                ctx.strokeStyle = `rgba(239, 68, 68, ${0.1 + qualityRatio * 0.2})`;
              }
              ctx.lineWidth = Math.max(0.8, qualityRatio * 2);
              ctx.stroke();
            }
          });
        });
      }

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
        ctx.strokeStyle = pkt.priority === 0 ? 'rgba(239, 68, 68, 0.7)' : pkt.isAck ? 'rgba(16, 185, 129, 0.7)' : 'rgba(6, 182, 212, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        const orbRadius = pkt.priority === 0 ? 6 : 4.5;
        ctx.arc(currentX, currentY, orbRadius, 0, Math.PI * 2);
        
        if (pkt.priority === 0) {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
        } else if (pkt.isAck) {
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
        } else {
          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#06b6d4';
        }
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(pkt.messageType, currentX + 8, currentY - 6);
      });

      nodes.forEach(node => {
        const isSelected = node.id === selectedNodeId;
        const isHighlighted = highlightedPathNodeIds.includes(node.id);
        const citizenTicketId = citizenOriginNodeMap.get(node.id);
        drawNode(ctx, node, isSelected, isHighlighted, showLabels, showQueueBadges, animPhaseRef.current, citizenTicketId);
      });

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
    zoom,
    panOffset,
    showLinks,
    showRadii,
    showIncidents,
    showLabels,
    showQueueBadges
  ]);

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    const step = 50;

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
  };

  const drawIncidentZone = (ctx: CanvasRenderingContext2D, inc: Incident, phase: number) => {
    const pulse = Math.sin(phase) * 6;
    const currentRadius = inc.radius + pulse;

    const grad = ctx.createRadialGradient(
      inc.epicenterX, inc.epicenterY, 0,
      inc.epicenterX, inc.epicenterY, currentRadius
    );

    if (inc.type === 'EARTHQUAKE') {
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
      grad.addColorStop(0.7, 'rgba(239, 68, 68, 0.1)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    } else if (inc.type === 'FLOOD') {
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
      grad.addColorStop(0.7, 'rgba(59, 130, 246, 0.1)');
      grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    } else {
      grad.addColorStop(0, 'rgba(249, 115, 22, 0.35)');
      grad.addColorStop(0.7, 'rgba(249, 115, 22, 0.1)');
      grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)';
    }

    ctx.beginPath();
    ctx.arc(inc.epicenterX, inc.epicenterY, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#f87171';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚠ ${inc.name}`, inc.epicenterX, inc.epicenterY - currentRadius - 8);
    ctx.font = '500 9px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(`RF Attenuation: ${(inc.rfInterferenceFactor * 100).toFixed(0)}%`, inc.epicenterX, inc.epicenterY - currentRadius + 6);
  };

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
    let nodeColor = '#10b981';

    if (node.status === 'FAILED' || node.status === 'OFFLINE') {
      nodeColor = '#ef4444';
    } else if (node.status === 'LOW_BATTERY' || node.battery < 20) {
      nodeColor = '#f59e0b';
    } else if (node.status === 'CONGESTED') {
      nodeColor = '#f97316';
    }

    if (node.type === 'GATEWAY') {
      nodeRadius = 13;
      nodeColor = node.status === 'FAILED' ? '#ef4444' : '#8b5cf6';
    } else if (node.type === 'COMMAND') {
      nodeRadius = 12;
      nodeColor = '#06b6d4';
    } else if (node.type === 'VICTIM') {
      nodeRadius = 10;
      nodeColor = node.status === 'FAILED' ? '#ef4444' : '#ec4899';
    }

    if (isSelected || isHighlighted) {
      ctx.beginPath();
      const ringRadius = nodeRadius + 8 + Math.sin(phase * 2) * 3;
      ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isSelected ? '#06b6d4' : '#10b981';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = isSelected ? '#06b6d4' : '#10b981';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    if (node.type === 'VICTIM' && node.status !== 'FAILED') {
      const pulseSize = (Math.sin(phase * 3) + 1) * 8;
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius + pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = citizenTicketId ? 'rgba(239, 68, 68, 0.7)' : 'rgba(236, 72, 153, 0.4)';
      ctx.lineWidth = citizenTicketId ? 2.5 : 1.5;
      ctx.stroke();
    }

    const batteryRatio = node.battery / 100;
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius + 3.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * batteryRatio);
    ctx.strokeStyle = node.battery > 50 ? '#10b981' : node.battery > 20 ? '#f59e0b' : '#ef4444';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
    ctx.fillStyle = nodeColor;
    ctx.fill();
    ctx.strokeStyle = '#0a0f1d';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const symbol = node.type === 'GATEWAY' ? 'GW' : node.type === 'COMMAND' ? 'HQ' : node.type === 'VICTIM' ? 'V' : 'R';
    ctx.fillText(symbol, node.x, node.y);

    if (drawQueue && node.queueSize > 0) {
      const badgeX = node.x + nodeRadius + 2;
      const badgeY = node.y - nodeRadius - 2;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = node.queueSize > 25 ? '#ef4444' : '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#0a0f1d';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.fillText(node.queueSize.toString(), badgeX, badgeY);
    }

    // Prominent Citizen Ticket Flag Beacon
    if (citizenTicketId) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`🚨 ${citizenTicketId}`, node.x, node.y - nodeRadius - 8);
    }

    if (drawLabels) {
      ctx.font = '500 10px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.name, node.x, node.y + nodeRadius + 6);
    }
  };

  const drawGatewayUplink = (ctx: CanvasRenderingContext2D, gw: MeshGateway, phase: number) => {
    const beamAlpha = (Math.sin(phase * 2) + 1) * 0.15 + 0.1;
    const grad = ctx.createLinearGradient(gw.x, gw.y, gw.x, gw.y - 50);
    grad.addColorStop(0, `rgba(139, 92, 246, ${beamAlpha})`);
    grad.addColorStop(1, 'rgba(139, 92, 246, 0)');

    ctx.beginPath();
    ctx.moveTo(gw.x - 12, gw.y);
    ctx.lineTo(gw.x + 12, gw.y);
    ctx.lineTo(gw.x + 4, gw.y - 45);
    ctx.lineTo(gw.x - 4, gw.y - 45);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.fillStyle = '#c084fc';
    ctx.font = '600 8px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SATCOM ▲', gw.x, gw.y - 48);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = screenToWorld(e.clientX, e.clientY);
    const clickedNode = nodes.find(n => {
      const dx = n.x - coords.x;
      const dy = n.y - coords.y;
      return Math.sqrt(dx * dx + dy * dy) <= 18;
    });

    if (clickedNode) {
      setDraggedNodeId(clickedNode.id);
      selectNode(clickedNode.id);
      if (onNodeSelect) onNodeSelect(clickedNode);
    } else {
      setIsPanning(true);
      setMouseStart({ x: e.clientX, y: e.clientY });
      selectNode(null);
      if (onNodeSelect) onNodeSelect(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNodeId) {
      const coords = screenToWorld(e.clientX, e.clientY);
      moveNode(draggedNodeId, Math.round(coords.x), Math.round(coords.y));
    } else if (isPanning) {
      const dx = e.clientX - mouseStart.x;
      const dy = e.clientY - mouseStart.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setMouseStart({ x: e.clientX, y: e.clientY });
    } else {
      const coords = screenToWorld(e.clientX, e.clientY);
      const hovered = nodes.find(n => {
        const dx = n.x - coords.x;
        const dy = n.y - coords.y;
        return Math.sqrt(dx * dx + dy * dy) <= 16;
      }) || null;

      setHoveredNode(hovered);
      setHoverPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.max(0.4, Math.min(2.5, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full bg-[#080c14] overflow-hidden rounded-xl border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs">
        <span className="flex items-center gap-1.5 text-cyan-400 font-semibold tracking-wide">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          DISASTER MESH TOPOLOGY
        </span>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1 text-slate-300">
          <Wifi className="w-3 h-3 text-cyan-400" />
          <span>Simulated communication range:</span>
          <span className="font-mono text-cyan-300 font-bold">{simulatedRangeKm.toFixed(1)} km</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1 text-slate-300">
          <BatteryCharging className="w-3 h-3 text-emerald-400" />
          <span>Simulated Battery:</span>
          <span className="font-mono text-emerald-300 font-bold">Active</span>
        </div>
      </div>

      {/* Layer Visibility & Zoom Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs">
        <button
          onClick={() => setShowLinks(!showLinks)}
          title="Toggle Wireless Links"
          className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
            showLinks ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wifi className="w-3 h-3" />
          <span>Links</span>
        </button>

        <button
          onClick={() => setShowRadii(!showRadii)}
          title="Toggle Gateway & Range Radii"
          className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
            showRadii ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3 h-3" />
          <span>Radii</span>
        </button>

        <button
          onClick={() => setShowIncidents(!showIncidents)}
          title="Toggle Hazard Zones"
          className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
            showIncidents ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3 h-3" />
          <span>Hazards</span>
        </button>

        <button
          onClick={() => setShowLabels(!showLabels)}
          title="Toggle Node Labels"
          className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
            showLabels ? 'bg-slate-700 text-slate-200' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3 h-3" />
          <span>Labels</span>
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <button
          onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
          title="Zoom In"
          className="p-1 hover:bg-slate-800 rounded text-slate-300"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
          title="Zoom Out"
          className="p-1 hover:bg-slate-800 rounded text-slate-300"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetView}
          title="Reset Viewport"
          className="p-1 hover:bg-slate-800 rounded text-slate-300"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Canvas Component */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-[11px] text-slate-300 shadow-lg">
        <span className="font-semibold text-slate-400">LEGEND:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
          <span>Relief Gateway</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
          <span>Victim Node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Healthy Relay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>Low Battery</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          <span>Failed</span>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredNode && (
        <div
          className="fixed z-50 pointer-events-none bg-slate-950/95 border border-slate-700/80 rounded-lg p-2.5 shadow-2xl text-xs text-slate-200 backdrop-blur-md max-w-xs transition-opacity duration-75"
          style={{ left: hoverPos.x + 14, top: hoverPos.y - 10 }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1.5">
            <span className="font-bold text-cyan-400">{hoveredNode.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
              hoveredNode.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-300' :
              hoveredNode.status === 'LOW_BATTERY' ? 'bg-amber-500/20 text-amber-300' :
              hoveredNode.status === 'CONGESTED' ? 'bg-orange-500/20 text-orange-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {hoveredNode.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <span className="text-slate-400">Type:</span>
            <span className="font-mono text-slate-200">{hoveredNode.type}</span>
            
            <span className="text-slate-400">Battery:</span>
            <span className="font-mono text-emerald-400 font-semibold">{hoveredNode.battery.toFixed(1)}%</span>
            
            <span className="text-slate-400">Queue Load:</span>
            <span className="font-mono text-cyan-300">{hoveredNode.queueSize} / {hoveredNode.maxQueueSize}</span>
            
            <span className="text-slate-400">Active Neighbors:</span>
            <span className="font-mono text-slate-200">{hoveredNode.neighbours.length} nodes</span>

            <span className="text-slate-400">Reliability:</span>
            <span className="font-mono text-slate-200">{(hoveredNode.reliability * 100).toFixed(0)}%</span>
          </div>

          <div className="mt-1.5 pt-1 border-t border-slate-800 text-[10px] text-slate-500 italic">
            Click to inspect telemetry or drag to move
          </div>
        </div>
      )}
    </div>
  );
};
