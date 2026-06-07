/**
 * Human-readable device label sent as `device` on auth requests (handover §2.2),
 * so the user can recognize sessions later.
 */
import { Platform } from 'react-native';
import * as Device from 'expo-device';

export function deviceName(): string {
  const model = Device.modelName ?? Device.deviceName ?? Platform.OS;
  const os = `${Platform.OS} ${Device.osVersion ?? ''}`.trim();
  return `${model} (${os})`;
}
