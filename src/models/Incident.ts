export type IncidentType = 'EARTHQUAKE' | 'FLOOD' | 'FIRE' | 'CYCLONE';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Incident {
  id: string;
  type: IncidentType;
  name: string;
  epicenterX: number; // coordinate X in simulation canvas units
  epicenterY: number; // coordinate Y in simulation canvas units
  radius: number; // radius of hazard/RF interference zone in canvas units
  severity: IncidentSeverity;
  active: boolean;
  startedAt: number;
  description: string;
  rfInterferenceFactor: number; // 0.0 to 1.0 (degrades packet delivery reliability in affected area)
}
