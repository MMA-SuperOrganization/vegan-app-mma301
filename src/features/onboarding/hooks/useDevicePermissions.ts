import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { Camera } from 'expo-camera';
import * as Notifications from 'expo-notifications';

export type PermissionState = 'idle' | 'granted' | 'denied' | 'settings';

function toPermissionState(result: {
  granted: boolean;
  canAskAgain: boolean;
}): PermissionState {
  if (result.granted) return 'granted';
  return result.canAskAgain ? 'denied' : 'settings';
}

export function permissionLabel(kind: string, state: PermissionState) {
  if (state === 'granted') return `✓ Đã cho phép ${kind}`;
  if (state === 'settings') return `Mở Cài đặt cho ${kind}`;
  if (state === 'denied') return `Thử lại quyền ${kind}`;
  return `Cho phép ${kind}`;
}

export function useDevicePermissions() {
  const [camera, setCamera] = useState<PermissionState>('idle');
  const [notifications, setNotifications] = useState<PermissionState>('idle');

  useEffect(() => {
    void Camera.getCameraPermissionsAsync()
      .then((result) => setCamera(toPermissionState(result)))
      .catch(() => setCamera('idle'));
    void Notifications.getPermissionsAsync()
      .then((result) => setNotifications(toPermissionState(result)))
      .catch(() => setNotifications('idle'));
  }, []);

  const requestCamera = async () => {
    if (camera === 'settings') return Linking.openSettings();
    setCamera(toPermissionState(await Camera.requestCameraPermissionsAsync()));
  };

  const requestNotifications = async () => {
    if (notifications === 'settings') return Linking.openSettings();
    setNotifications(
      toPermissionState(await Notifications.requestPermissionsAsync())
    );
  };

  return { camera, notifications, requestCamera, requestNotifications };
}
