export enum Rank {
  CADET = "Cadet",
  LANCE_CORPORAL = "Lance Corporal",
  CORPORAL = "Corporal",
  SERGEANT = "Sergeant",
  UNDER_OFFICER = "Under Officer",
  SENIOR_UNDER_OFFICER = "Senior Under Officer"
}

export enum Wing {
  ARMY = "Army",
  NAVY = "Navy",
  AIR_FORCE = "Air Force"
}

export enum AttendanceStatus {
  PRESENT = "Present",
  ABSENT = "Absent",
  LEAVE = "On Leave",
  DUTY = "Special Duty"
}

export interface Cadet {
  id: string;
  regimentalNumber: string;
  password?: string; // Added for student login
  fullName: string;
  rank: Rank;
  wing: Wing;
  platoon: string;
  joinDate: string; // ISO Date
}

export interface AttendanceRecord {
  date: string; // ISO YYYY-MM-DD
  records: Record<string, AttendanceStatus>; // cadetId -> Status
  notes?: string;
}

export interface DrillSchedule {
  id: string;
  title: string;
  date: string;
  description: string;
  mandatory: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  recipientId: string; // 'all' or specific user ID
  type: 'info' | 'alert' | 'schedule';
}

export type AppView = 'dashboard' | 'roster' | 'attendance' | 'reports' | 'settings';

export type UserRole = 'admin' | 'cadet';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  cadetId?: string; // Present if role is cadet
  rank?: string;
}

export interface CloudConfig {
  apiKey: string;
  binId: string;
  autoSync: boolean;
  lastSync: string | null;
}

export type SyncStatus = 'idle' | 'syncing' | 'saved' | 'error';
