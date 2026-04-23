export type SightingStatus = 'Pending' | 'Approved' | 'Rejected';

export type AnimalType = 'Tiger' | 'Elephant' | 'Deer' | 'Leopard' | 'Human';

export interface Sighting {
  id: string;
  images: string[]; // base64 strings
  animalType: AnimalType;
  detectedSpecies: string;
  confidenceScore: number;
  isDanger: boolean;
  status: SightingStatus;
  timestamp: string;
}

export interface Stats {
  total: number;
  byType: Record<AnimalType | string, number>;
  dangerAlerts: number;
}
