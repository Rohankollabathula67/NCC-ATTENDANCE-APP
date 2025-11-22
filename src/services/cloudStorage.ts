import { CloudConfig, Cadet, AttendanceStatus, Notification } from '../types';

interface StorageData {
  cadets: Cadet[];
  attendanceHistory: Record<string, Record<string, AttendanceStatus>>;
  notifications: Notification[];
  updatedAt: string;
  version: string;
}

const BASE_URL = 'https://api.jsonbin.io/v3/b';

export const saveToCloud = async (
  config: CloudConfig,
  data: Omit<StorageData, 'updatedAt' | 'version'>
): Promise<boolean> => {
  if (!config.apiKey || !config.binId) return false;

  const payload: StorageData = {
    ...data,
    updatedAt: new Date().toISOString(),
    version: '1.0.0'
  };

  try {
    const response = await fetch(`${BASE_URL}/${config.binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': config.apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Cloud save failed: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Cloud Storage Error:', error);
    throw error;
  }
};

export const loadFromCloud = async (config: CloudConfig): Promise<StorageData | null> => {
  if (!config.apiKey || !config.binId) return null;

  try {
    const response = await fetch(`${BASE_URL}/${config.binId}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': config.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Cloud load failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.record as StorageData;
  } catch (error) {
    console.error('Cloud Storage Error:', error);
    throw error;
  }
};
