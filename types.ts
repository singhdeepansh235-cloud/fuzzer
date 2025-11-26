
export enum Severity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum EngineStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  module: string; // e.g., 'RECON', 'FUZZ', 'API'
}

export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  endpoint: string;
  payload: string;
  timestamp: number;
}

export interface ScanConfig {
  targetUrl: string;
  engines: {
    recon: boolean; // Engine A
    fuzzing: boolean; // Engine B
    custom: boolean; // Engine C
    reporting: boolean; // Engine D
  };
  aggressionLevel: 'stealth' | 'standard' | 'aggressive';
}

export interface ScanStats {
  requests: number;
  duration: number;
  vulnsFound: number;
  criticalCount: number;
  highCount: number;
  subdomains: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst';
  createdAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}
