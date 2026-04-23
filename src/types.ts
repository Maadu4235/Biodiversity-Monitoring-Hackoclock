export type UserRole = 'User' | 'Officer';

export interface User {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  name: string;
  isApproved?: boolean; // For Officers
}

export interface AuthResponse {
  user: User;
  token: string;
}

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
  location: string;
  aiMetadata?: {
    boundingBox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
    source: 'YOLO' | 'Gemini';
    rawOutput?: string;
  };
}

export interface Stats {
  total: number;
  byType: Record<AnimalType | string, number>;
  dangerAlerts: number;
}
