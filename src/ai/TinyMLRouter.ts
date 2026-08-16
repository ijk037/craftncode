import type { MeshNode } from '../models/Node';

export interface LinkMetrics {
  distance: number;
  quality: number;
  snr: number;
  rssi: number;
  inRange: boolean;
}

export interface NeighborAiEvaluation {
  neighborId: string;
  neighborName: string;
  successProbability: number; // 0.0 - 1.0 (e.g. 0.94 -> 94%)
  heuristicScore: number;
  hybridScore: number;
  isSelected: boolean;
  features: {
    batteryRatio: number;
    rssiNorm: number;
    snrNorm: number;
    queueAvailability: number;
    distanceProgressScore: number;
    historicalReliability: number;
  };
  reasoning: string;
}

export interface NodeAiDiagnostic {
  nodeId: string;
  linkHealthForecast: 'STABLE' | 'DEGRADING' | 'CRITICAL_RISK';
  predictedFailureRisk: number; // 0.0 - 1.0
  evaluations: NeighborAiEvaluation[];
  selectedNextHopId: string | null;
  aiMode: 'BASELINE_HEURISTIC' | 'TINYML_HYBRID' | 'PROACTIVE_AI';
  timestamp: number;
}

/**
 * TinyML Model weights (Quantized feed-forward neural layers emulated for sub-millisecond on-node execution)
 * Input features: [Battery(0-1), RSSI(0-1), SNR(0-1), QueueSpace(0-1), Progress(0-1), Reliability(0-1)]
 */
class TinyMLNeuralClassifier {
  // Layer 1 weights (6 inputs -> 4 hidden neurons)
  private W1: number[][] = [
    [0.35, -0.15, 0.40, 0.50, 0.60, 0.45], // Hidden 1 (Congestion & Progress)
    [0.60, 0.55, 0.45, -0.20, 0.30, 0.50], // Hidden 2 (RF Link Quality & Battery)
    [0.70, 0.20, 0.15, 0.40, 0.25, 0.65],  // Hidden 3 (Power & Historical Reliability)
    [-0.30, 0.65, 0.70, -0.40, 0.40, 0.35], // Hidden 4 (RF SNR Resilience)
  ];
  private b1: number[] = [0.1, -0.05, 0.15, -0.1];

  // Layer 2 weights (4 hidden -> 1 output logit)
  private W2: number[] = [0.45, 0.55, 0.40, 0.50];
  private b2: number = 0.05;

  private relu(x: number): number {
    return Math.max(0, x);
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x))));
  }

  /**
   * Predicts P(Successful Delivery across this link)
   */
  public predictSuccessProbability(features: number[]): number {
    // Hidden layer
    const h: number[] = new Array(4).fill(0);
    for (let i = 0; i < 4; i++) {
      let sum = this.b1[i];
      for (let j = 0; j < 6; j++) {
        sum += this.W1[i][j] * features[j];
      }
      h[i] = this.relu(sum);
    }

    // Output neuron
    let out = this.b2;
    for (let i = 0; i < 4; i++) {
      out += this.W2[i] * h[i];
    }

    return this.sigmoid(out);
  }
}

const neuralModel = new TinyMLNeuralClassifier();

export class TinyMLRouter {
  /**
   * Normalizes raw physical link & node telemetry into [0.0, 1.0] feature vector
   */
  public static extractFeatures(
    _currentNode: MeshNode,
    neighbor: MeshNode,
    metrics: LinkMetrics,
    closestGatewayDistCurrent: number,
    closestGatewayDistNeighbor: number
  ) {
    const batteryRatio = Math.max(0, Math.min(1, neighbor.battery / 100));
    
    // RSSI normalized from [-120 dBm, -40 dBm] -> [0, 1]
    const rssiNorm = Math.max(0, Math.min(1, (metrics.rssi + 120) / 80));
    
    // SNR normalized from [-15 dB, +15 dB] -> [0, 1]
    const snrNorm = Math.max(0, Math.min(1, (metrics.snr + 15) / 30));
    
    // Queue space availability [0 = full buffer, 1 = empty buffer]
    const queueAvailability = Math.max(0, 1 - (neighbor.queueSize / neighbor.maxQueueSize));
    
    // Progress towards closest Gateway [1 = huge step closer, 0 = moving away]
    const distDelta = closestGatewayDistCurrent - closestGatewayDistNeighbor;
    const progressScore = Math.max(0, Math.min(1, (distDelta + 50) / 100));
    
    // Historical link reliability
    const totalTx = neighbor.totalPacketsForwarded + neighbor.totalPacketsDropped;
    const historicalReliability = totalTx > 0 
      ? Math.max(0.2, neighbor.totalPacketsForwarded / totalTx) 
      : 0.95;

    return {
      featuresArray: [batteryRatio, rssiNorm, snrNorm, queueAvailability, progressScore, historicalReliability],
      featuresObj: {
        batteryRatio,
        rssiNorm,
        snrNorm,
        queueAvailability,
        distanceProgressScore: progressScore,
        historicalReliability,
      }
    };
  }

  /**
   * Evaluates all candidate neighbors using TinyML + Heuristics
   */
  public static evaluateCandidates(
    currentNode: MeshNode,
    neighbors: MeshNode[],
    metricsMap: Map<string, LinkMetrics>,
    closestGwDistCurrent: number,
    gwDistMap: Map<string, number>,
    heuristicScoresMap: Map<string, number>,
    aiMode: 'BASELINE_HEURISTIC' | 'TINYML_HYBRID' | 'PROACTIVE_AI' = 'TINYML_HYBRID'
  ): NodeAiDiagnostic {
    let bestNeighborId: string | null = null;
    let highestFinalScore = -Infinity;

    const evaluations: NeighborAiEvaluation[] = neighbors.map(nbr => {
      const metrics: LinkMetrics = metricsMap.get(nbr.id) || { distance: 999, rssi: -120, snr: -15, quality: 0.1, inRange: true };
      const nbrGwDist = gwDistMap.get(nbr.id) || closestGwDistCurrent;
      const heuristicScore = heuristicScoresMap.get(nbr.id) || 0;

      const { featuresArray, featuresObj } = this.extractFeatures(
        currentNode,
        nbr,
        metrics,
        closestGwDistCurrent,
        nbrGwDist
      );

      // TinyML Inference
      const successProbability = neuralModel.predictSuccessProbability(featuresArray);

      // Score blending based on AI mode
      let hybridScore: number;
      if (aiMode === 'BASELINE_HEURISTIC') {
        hybridScore = heuristicScore;
      } else if (aiMode === 'PROACTIVE_AI') {
        // AI weighted heavily with link degradation penalty
        hybridScore = (heuristicScore * 0.3) + (successProbability * 0.7);
      } else {
        // TINYML_HYBRID: Balanced ensemble
        hybridScore = (heuristicScore * 0.5) + (successProbability * 0.5);
      }

      // Penalize dead or critically failing neighbors
      if (nbr.status === 'FAILED' || nbr.status === 'OFFLINE' || nbr.battery <= 2) {
        hybridScore = -999;
      }

      if (hybridScore > highestFinalScore && hybridScore > -100) {
        highestFinalScore = hybridScore;
        bestNeighborId = nbr.id;
      }

      // Generate explainable AI reasoning
      let reasoning = `P(Success) ${(successProbability * 100).toFixed(0)}%`;
      if (featuresObj.queueAvailability < 0.3) reasoning += ' • Heavy Buffer Load';
      if (featuresObj.batteryRatio < 0.2) reasoning += ' • Low Power Risk';
      if (featuresObj.snrNorm < 0.3) reasoning += ' • RF Fading';
      if (featuresObj.distanceProgressScore > 0.6) reasoning += ' • Optimal Gateway Progress';

      return {
        neighborId: nbr.id,
        neighborName: nbr.name,
        successProbability,
        heuristicScore,
        hybridScore,
        isSelected: false,
        features: featuresObj,
        reasoning,
      };
    });

    // Mark the selected next-hop
    evaluations.forEach(ev => {
      ev.isSelected = (ev.neighborId === bestNeighborId);
    });

    // Proactive link degradation forecast
    const avgSnr = evaluations.reduce((acc, e) => acc + e.features.snrNorm, 0) / Math.max(1, evaluations.length);
    const avgBattery = evaluations.reduce((acc, e) => acc + e.features.batteryRatio, 0) / Math.max(1, evaluations.length);
    
    let linkHealthForecast: 'STABLE' | 'DEGRADING' | 'CRITICAL_RISK' = 'STABLE';
    let failureRisk = 0.05;

    if (avgSnr < 0.25 || avgBattery < 0.2) {
      linkHealthForecast = 'CRITICAL_RISK';
      failureRisk = 0.85;
    } else if (avgSnr < 0.45 || avgBattery < 0.35) {
      linkHealthForecast = 'DEGRADING';
      failureRisk = 0.45;
    }

    return {
      nodeId: currentNode.id,
      linkHealthForecast,
      predictedFailureRisk: failureRisk,
      evaluations: evaluations.sort((a, b) => b.hybridScore - a.hybridScore),
      selectedNextHopId: bestNeighborId,
      aiMode,
      timestamp: Date.now(),
    };
  }
}
