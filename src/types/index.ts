export interface Project {
  id: number;
  title: string;
  codename: string;
  type: string;
  status: 'ACTIVE' | 'DEPLOYED' | 'OPERATIONAL';
  threatLevel: 'HIGH IMPACT' | 'CUTTING EDGE' | 'STEALTH MODE' | 'EXPERIMENTAL';
  tech: string[];
  description: string;
  features: string[];
  github?: string;
  liveUrl?: string;
  icon: string; // Icon identifier for ProjectIcon component
}

export interface MousePosition {
  x: number;
  y: number;
}

