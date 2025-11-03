// src/utils/projectCoordinates.ts
export interface ProjectLocation {
  projectId: number;
  lat: number;
  lng: number;
  city: string;
  country: string;
}

export const PROJECT_LOCATIONS: ProjectLocation[] = [
  {
    projectId: 1, // Web Development Agency
    lat: 37.7749,
    lng: -122.4194,
    city: 'San Francisco',
    country: 'USA',
  },
  {
    projectId: 2, // Smart Advisor
    lat: 40.7128,
    lng: -74.0060,
    city: 'New York',
    country: 'USA',
  },
  {
    projectId: 3, // Local Business Lead Generator
    lat: 30.2672,
    lng: -97.7431,
    city: 'Austin',
    country: 'USA',
  },
  {
    projectId: 4, // Theory Validation System
    lat: 47.6062,
    lng: -122.3321,
    city: 'Seattle',
    country: 'USA',
  },
];

export const getLocationForProject = (projectId: number): ProjectLocation | undefined => {
  return PROJECT_LOCATIONS.find(loc => loc.projectId === projectId);
};

