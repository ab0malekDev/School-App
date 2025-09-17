import Constants from 'expo-constants';

let deviceId: string | null = null;

export const getDeviceId = async (): Promise<string> => {
  if (deviceId) {
    return deviceId;
  }

  if (Constants && Constants.installationId) {
    deviceId = Constants.installationId;
  }

  if (!deviceId) {
    // Fallback for safety
    console.warn('Could not get a stable device ID. Falling back to random ID.');
    deviceId = 'fallback-' + Math.random().toString(36).substring(2, 15);
  }

  return deviceId as string;
}; 