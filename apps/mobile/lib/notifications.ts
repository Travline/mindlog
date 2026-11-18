import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api } from './api';
import type { DevicePushToken } from 'expo-notifications';

const DEVICE_TOKEN_KEY = 'mindlog-push-token';
export type PermissionState = 'active' | 'disabled' | 'unavailable' | 'error';
export const supportsPush = Platform.OS === 'android' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient && Device.isDevice;
export async function syncPush(session: string, ask: boolean, devicePushToken?: DevicePushToken): Promise<PermissionState> {
  if (!supportsPush) return 'unavailable';
  const Notifications = await import('expo-notifications');
  await Notifications.setNotificationChannelAsync('default', {name:'Notificaciones',importance:Notifications.AndroidImportance.DEFAULT});
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted && permission.canAskAgain && ask) permission = await Notifications.requestPermissionsAsync();
  const saved = await SecureStore.getItemAsync(DEVICE_TOKEN_KEY);
  const channel = await Notifications.getNotificationChannelAsync('default');
  if (!permission.granted || channel?.importance === Notifications.AndroidImportance.NONE) {
    if (saved) {
      try { await api('/notifications/devices',session,'DELETE',{token:saved}); await SecureStore.deleteItemAsync(DEVICE_TOKEN_KEY); }
      catch { /* Se vuelve a intentar al recuperar la conexión. */ }
    }
    return 'disabled';
  }
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  if (!projectId) return 'error';
  const token = (await Notifications.getExpoPushTokenAsync({projectId,...(devicePushToken ? {devicePushToken} : {})})).data;
  if (saved && saved !== token) await api('/notifications/devices',session,'DELETE',{token:saved});
  await api('/notifications/devices',session,'PUT',{token});
  await SecureStore.setItemAsync(DEVICE_TOKEN_KEY,token);
  return 'active';
}
export async function unregisterPush(session: string) {
  const saved = await SecureStore.getItemAsync(DEVICE_TOKEN_KEY);
  if (saved) {
    await api('/notifications/devices',session,'DELETE',{token:saved});
    await SecureStore.deleteItemAsync(DEVICE_TOKEN_KEY);
  }
}
