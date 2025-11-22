import { Cadet, Rank, Wing, AttendanceStatus } from './types';

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'password123'
};

export const MOCK_CADETS: Cadet[] = [];

export const MOCK_ATTENDANCE: Record<string, Record<string, AttendanceStatus>> = {};

export const PLATOONS = ['Alpha', 'Bravo', 'Charlie', 'Delta'];