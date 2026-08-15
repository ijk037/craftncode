# RESQ-MESH — Software-Only Disaster Mesh Network MVP

**RESQ-MESH** is an interactive, browser-based simulation of a decentralized, self-healing disaster mesh network protocol modeled after low-power LoRa wireless communications.

---

## ⚡ Key Protocol Innovations Simulated

1. **Multi-Hop Heuristic Routing**  
   Calculates candidate scores dynamically at each hop using:
   $$\text{Score} = W_1 \cdot \text{Progress} + W_2 \cdot \text{LinkQuality} + W_3 \cdot \text{Battery} + W_4 \cdot \text{Reliability} - W_5 \cdot \text{Congestion} - W_6 \cdot \text{HopPenalty}$$

2. **Priority Preemption (SOS Tier 0)**  
   When buffers reach capacity ($50/50$), Priority 0 emergency packets (*SOS, MEDICAL, TRAPPED*) preemptively evict lower-priority logistics packets (*WATER, FOOD, TELEMETRY*).

3. **Store-and-Forward (DTN Resilience)**  
   When partitions or severe RF interference occurs, packets enter a local non-volatile `STORED` state and automatically resume transit upon topology recovery.

4. **Dynamic Mid-Transit Rerouting**  
   If an in-flight relay fails or is depleted, neighboring nodes immediately recalculate alternative paths with loop prevention.

5. **Relief Gateway Egress & Reverse ACK**  
   When packets reach SatCom/Cellular relief gateways, a reverse `ACK` packet is automatically routed back to the victim origin.

6. **Non-Smartphone SMS Gateway Bridge**  
   Simulates 2G/GSM feature phones converting raw text (`SOS 2 PEOPLE MEDICAL AT 26.91, 75.78`) into structured 48-byte LoRa mesh frames.

---

## 🚀 Running the Project Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build production bundle
npm run build
```

---

## 🧪 Pre-Configured Test Scenarios
1. **Normal Multi-Hop SOS Delivery & Reverse ACK**
2. **Mid-Transit Node Failure & Dynamic Reroute**
3. **Heavy Congestion & Priority 0 Preemption**
4. **Low-Battery Avoidance Energy Routing**
5. **Store-and-Forward Network Partition Recovery**
6. **Gateway Outage & Egress Failover**
"# craftncode" 
