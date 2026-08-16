# 🛰️ RESQ-MESH: Autonomous Decentralized Disaster Communications & Distributed AI Network

[![Production Build](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-blue.svg)](https://nodejs.org/)
[![Local AI](https://img.shields.io/badge/AI-Ollama%20%7C%20Qwen%202.5-orange.svg)](https://ollama.com/)
[![Zero Internet](https://img.shields.io/badge/Network-100%25%20Offline%20P2P-success.svg)](#)

> **RESQ-MESH** is a mission-critical, peer-to-peer disaster communications system designed to operate with **zero internet, zero cellular towers, and zero cloud servers**. It combines multi-hop LoRa radio mesh simulation, local on-device SLM emergency parsing, distributed on-node TinyML link forecasting, hardware satellite GPS tracking, and real-time offline GIS navigation.

---

## 📑 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Key Features](#-key-features)
3. [Prerequisites & System Requirements](#-prerequisites--system-requirements)
4. [How to Setup & Run Local AI Model (Ollama + Qwen 2.5)](#-how-to-setup--run-local-ai-model-ollama--qwen-25)
5. [Quickstart & Installation](#-quickstart--installation)
6. [How to Use the Application](#-how-to-use-the-application)
   - [1. Citizen Public Portal](#1-citizen-public-portal-calm-interface)
   - [2. Incident Command Center](#2-incident-command-center-tactical-interface)
   - [3. Real-Time Offline GIS & GPS Map](#3-real-time-offline-gis--satellite-gps-map)
   - [4. Emergency Survival & Improvised First-Aid Guide](#4-emergency-survival--first-aid-manual)
7. [Simulation Scenarios & Stress Testing](#-simulation-scenarios--stress-testing)
8. [Technical Specifications](#-technical-specifications)
9. [Project Structure](#-project-structure)
10. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🏗️ Architecture Overview

```text
                  🚑 RESCUE SQUADS / RELIEF COMMAND
                                │
                      TACTICAL COMMAND PORTAL
                    (Local Host • Gateway Egress)
                                │
        ────────────────────────┼────────────────────────
                                │
                      LORA BACKBONE MESH
               (Multi-Hop Solar Relays • 433/868 MHz)
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
 [Relay Node #1]         [Relay Node #2]         [Relay Node #3]
 (TinyML Link AI)        (TinyML Link AI)        (TinyML Link AI)
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                      CITIZEN EDGE TIER
               (BLE / Wi-Fi Direct • Offline SLM)
                                │
             ┌──────────────────┴──────────────────┐
             ▼                                     ▼
     [Citizen Device A]                   [Citizen Device B]
   (Trapped / SOS Signal)              (Local First-Aid Triage)
```

---

## ✨ Key Features

* **🧠 100% Offline AI Emergency Triage (Qwen 2.5 SLM):**
  * Connects directly to local **Ollama** runtime (`http://localhost:11434`).
  * Converts unstructured, panicked distress text into structured **48-byte LoRa binary micro-frames** with zero hallucination.
* **🌐 Multi-Hop LoRa Radio Mesh Protocol:**
  * Implements dynamic multi-factor heuristic routing evaluating: Gateway Progress, SNR/RSSI Link Quality, Battery Depletion, Reliability, Congestion, and Loop Avoidance.
* **⚡ On-Node TinyML Link Forecasting:**
  * Neural link predictor running on every relay node forecasting RF degradation (`STABLE`, `DEGRADING`, `CRITICAL_RISK`).
* **🛰️ Hardware Satellite GPS & Offline GIS:**
  * Uses `navigator.geolocation.watchPosition` to track real satellite GPS coordinates without needing cellular data.
  * Standalone vector topography maps of India and real-time Leaflet GIS with offline IndexedDB tile storage.
* **🩹 British Red Cross Clinical First-Aid Manual:**
  * 16 offline emergency medical protocols (Bleeding, Fractures, CPR, Burns, Hypothermia) with improvised household substitutes (T-shirt tourniquets, plastic bag burn seals).
* **🔄 Closed-Loop Reverse ACK:**
  * Automatic reverse acknowledgment packets routed back from relief gateways to victim phones to confirm rescue dispatch.

---

## 💻 Prerequisites & System Requirements

* **Operating System:** Windows 10/11, macOS, or Linux
* **Node.js:** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
* **Package Manager:** `npm` (comes with Node.js)
* **Local AI Runtime:** [Ollama](https://ollama.com/) (Required for local offline Qwen 2.5 inference)
* **RAM:** 4 GB minimum (8 GB+ recommended)
* **Storage:** ~1 GB disk space

---

## 🤖 How to Setup & Run Local AI Model (Ollama + Qwen 2.5)

RESQ-MESH uses **Qwen 2.5 (0.5B or 1.5B)** running locally on your computer via **Ollama**. This ensures **complete privacy and 100% offline functionality**.

### Step 1: Install Ollama
Download and install Ollama from [https://ollama.com/download](https://ollama.com/download).

### Step 2: Download the Qwen 2.5 Model
Open your terminal (PowerShell, Command Prompt, or Terminal) and run:

```bash
ollama pull qwen2.5:0.5b
```

*(Optional: If you have a dedicated GPU, you can also pull the 1.5B model using `ollama pull qwen2.5:1.5b`)*

### Step 3: Configure CORS & Start Ollama Server

To allow the browser web application to talk to your local Ollama port (`11434`), start Ollama with CORS origins enabled:

#### On Windows (PowerShell):
```powershell
$env:OLLAMA_ORIGINS="*"
ollama serve
```

#### On Windows (Command Prompt):
```cmd
set OLLAMA_ORIGINS=*
ollama serve
```

#### On macOS / Linux:
```bash
OLLAMA_ORIGINS="*" ollama serve
```

> 💡 **Verification:** Open your browser and navigate to `http://localhost:11434`. You should see the message: `Ollama is running`.

---

## 🚀 Quickstart & Installation

### 1. Clone or Open the Repository
```bash
cd D:/vsc/craftncode
```

### 2. Install Project Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

The application will launch at:
👉 **`http://localhost:5173`**

### 4. Build for Production
To test the production build bundle:
```bash
npm run build
npm run preview
```

---

## 📖 How to Use the Application

### 1. Citizen Public Portal (Calm Interface)
* **Navigate:** The default view is the **Citizen Portal** (`#F5F3EE` warm theme).
* **AI Emergency Extraction:**
  1. Click the **"Offline AI Triage (Qwen 2.5)"** card in the left dock or the natural language text box.
  2. Type any emergency situation (e.g., *"Trapped on 2nd floor with 3 children, flood water rising fast, severe arm fracture"*).
  3. Click **"Auto-Parse with Edge SLM"**. Qwen 2.5 will instantly parse victim headcounts, injury details, priority tier, and binary LoRa telemetry.
* **1-Tap SOS Broadcast:**
  * Adjust demographic counters (Adults, Children, Elderly) and select incident category.
  * Click **"BROADCAST SOS SIGNAL"**. The packet will immediately enter the mesh simulation.
* **Live Rescue Status Tracker:**
  * Watch the 4-stage pipeline: `Broadcasting` ➔ `Mesh Relaying` ➔ `Gateway Delivered` ➔ `Rescue Dispatched`.
  * Chat directly with the Incident Commander via two-way LoRa payload messaging.

---

### 2. Incident Command Center (Tactical Interface)
* **Accessing Command:** Click **"Authority Sign-In"** in the top right header (Clearance PIN: `1122` or `0000`).
* **Interactive 60 FPS Mesh Map:**
  * Drag and move relay nodes, observe radio link radiation rings, and inspect link SNR/RSSI.
  * Monitor real-time packet hops across the disaster topography.
* **Citizen Triage Queue:**
  * View incoming SOS tickets grouped by urgency.
  * Click **"Generate Tactical AI Triage"** to have Qwen 2.5 stream incident clustering, trauma prioritization, and squad dispatch directives.
  * Dispatch rescue squads (`NDRF Rapid Squad #1`, `Civil Defense Unit #4`) and transmit official directives to victims.
* **On-Node Neural Diagnostics:**
  * Select any node to inspect candidate next-hop $P(\text{Success})$ probabilities calculated by the on-node TinyML engine.

---

### 3. Real-Time Offline GIS & Satellite GPS Map
* Click **"Real-Time GPS Map"** in the Citizen Portal left dock.
* **Hardware GPS Fix:** Automatically locks onto your real device GPS coordinates with an accuracy radius and heading cone.
* **Simulate Walk Mode:** Click the **"Simulate Walk"** button to simulate walking toward the nearest relief shelter and observe live moving NDRF rescue squads.
* **Offline Vector India Grid:** Click **"Offline India Grid"** to inspect national relief hubs (Jaipur, New Delhi, Mumbai, Bengaluru, Kolkata, Guwahati, Srinagar) with compass bearings and distance calculations.

---

### 4. Emergency Survival & First-Aid Manual
* Click **"Survival & First-Aid"** or **"No First-Aid Kit?"** in the Citizen Portal.
* Access 16 offline clinical emergency guides:
  * **Bleeding & Hemorrhage:** Direct pressure techniques + clean cloth tourniquet substitutes.
  * **Fractures & Trauma:** Improvised cardboard/wood splints.
  * **Burns & Scalds:** Plastic bag/food wrap sterile dressing.
  * **CPR Sequence:** Step-by-step 100–120 bpm compression guide.

---

## 🧪 Simulation Scenarios & Stress Testing

From the Command Center header, click **"Scenarios"** to trigger automated disaster drills:

1. **Scenario 1: Multi-Hop SOS Delivery & Reverse ACK** — Traverses 4 relay nodes to gateway, spawning an automatic confirmation ACK back to origin.
2. **Scenario 2: Mid-Transit Relay Failure & Dynamic Reroute** — Simulates a relay node power failure mid-flight, demonstrating instant dynamic detour routing.
3. **Scenario 3: Crisis Congestion & Priority Preemption** — Floods the network with 200 low-priority packets; injects a Priority-0 SOS to demonstrate immediate queue preemption.
4. **Scenario 4: Low-Battery Avoidance** — Drains relay batteries to 5%, demonstrating how heuristic weights steer packets along healthier nodes.
5. **Scenario 5: Store-and-Forward Partition Recovery** — Drops RF range to isolate nodes into local buffer storage; restores range to resume forwarding.
6. **Scenario 6: Gateway Failover** — Disables the primary SatCom gateway; active packets dynamically discover and egress via the backup drone gateway.
7. **Burst Stress Test:** Inject 100, 500, or 1,000 simultaneous packets from the **Command Dashboard** to test high-throughput buffer capacity.

---

## ⚙️ Technical Specifications

| Parameter | Specification |
| :--- | :--- |
| **Physical RF Simulation** | 433 / 868 MHz LoRa (Log-Distance Path Loss Model, $n=3.2$, Shadowing $\sigma=4$) |
| **LoRa Micro-Frame** | 48-Byte Binary Frame (`0xAA55` Preamble, Demographic Vectors, CRC-16) |
| **On-Device SLM** | Qwen 2.5-0.5B via Ollama REST API (`http://localhost:11434/api/chat`) |
| **On-Node Neural Engine** | Quantized TinyML Feedforward Neural Classifier ($6 \to 8 \to 4 \to 1$) |
| **Routing Algorithm** | Multi-Factor Dynamic Heuristic ($w_1\text{Prog} + w_2\text{Link} + w_3\text{Batt} + w_4\text{Rel} - w_5\text{Cong} - w_6\text{Hop}$) |
| **Mapping Engine** | Leaflet.js GIS (IndexedDB Tile Cache) + Standalone India Vector GeoJSON |
| **Frontend Stack** | React 19, TypeScript, Vite, Tailwind CSS / Custom Tokens, Lucide Icons |
| **State Management** | Zustand (Reactive high-performance store) |

---

## 📁 Project Structure

```text
src/
├── ai/
│   └── TinyMLRouter.ts           # On-node neural link success & degradation classifier
├── components/
│   ├── AuthorityLogin.tsx        # Command clearance authentication modal
│   ├── CitizenPortal.tsx         # Citizen offline self-help & SOS broadcasting view
│   ├── CitizenRequestsPanel.tsx  # Live SOS ticket queue & AI triage stream
│   ├── CommandDashboard.tsx      # Admin chaos injection, scenarios & heuristic controls
│   ├── EventLog.tsx              # High-density RF packet log terminal
│   ├── Header.tsx                # Master responsive dual-mode header
│   ├── IndiaVectorMap.tsx        # 100% standalone SVG vector map of India
│   ├── NetworkMap.tsx            # 60 FPS HTML5 canvas radio mesh visualizer
│   ├── NodeInspector.tsx         # On-node neural diagnostics & battery telemetry
│   ├── OfflineLLMModal.tsx       # Live Ollama connection health & model tester
│   ├── OfflineMapModal.tsx       # India vector map container modal
│   ├── PacketInspector.tsx       # Byte-level packet tracer & hop history
│   ├── RealTimeLeafletMap.tsx    # Live hardware GPS Leaflet map with moving squads
│   ├── RealTimeOfflineMapModal.tsx # Container for real-time Leaflet map
│   ├── ScenarioModal.tsx         # Automated disaster drill loader
│   └── SurvivalGuideModal.tsx    # 16-category British Red Cross medical manual
├── models/
│   ├── Gateway.ts                # Relief gateway interfaces
│   ├── Incident.ts               # Hazard disaster zone definitions
│   ├── LogEntry.ts               # Event terminal log formats
│   ├── Node.ts                   # Mesh node telemetry schema
│   ├── Packet.ts                 # LoRa packet & micro-frame structure
│   └── Transport.ts              # RF propagation & link metric physics
├── services/
│   └── webLlmService.ts          # Direct REST client to local Ollama Qwen 2.5
├── simulation/
│   ├── FailureEngine.ts          # Node fault injection & topology recalculation
│   ├── NetworkEngine.ts          # Initial node placement & link establishment
│   ├── QueueEngine.ts            # Priority sorting & preemption buffer manager
│   ├── RoutingEngine.ts          # Multi-objective candidate score evaluation
│   └── useSimulationClock.ts     # Physics tick interval loop
├── store/
│   └── useMeshStore.ts           # Central Zustand store & packet transit engine
├── utils/
│   └── geo.ts                    # Deduplicated Haversine distance & compass bearing math
├── types.ts                      # Consolidated domain type definitions
├── App.tsx                       # Master application view switcher & responsive layout
└── main.tsx                      # Vite React root mount
```

---

## ❓ Troubleshooting & FAQs

### Q1: Ollama shows "Offline / Not Responding" in the app?
1. Make sure Ollama is installed and running (`ollama serve`).
2. Verify that CORS is enabled with `$env:OLLAMA_ORIGINS="*"` on Windows before running `ollama serve`.
3. Check that model `qwen2.5:0.5b` is downloaded by running `ollama list`.

### Q2: Does the map need an internet connection?
* **No.** The **India Vector Grid** is rendered using mathematical vector contours with 0 network calls.
* The **Real-Time GPS Map** uses your device's built-in satellite GPS receiver (`navigator.geolocation.watchPosition`), which functions even in airplane mode.

### Q3: How do I test node failures or storm interference?
* Go to the **Command Center**, click on any relay node in the map, and click **"Inject Node Fault"** or **"Drain Battery to 5%"**. You will immediately see the mesh routing engine divert packets around the dead node.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
