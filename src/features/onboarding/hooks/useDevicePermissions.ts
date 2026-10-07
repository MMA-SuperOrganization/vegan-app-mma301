import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import { Camera } from 'expo-camera';
import { translate } from '@/i18n';

export type PermissionState =
  'idle' | 'granted' | 'denied' | 'settings' | 'unsupported';

const notificationsSupported = !isRunningInExpoGo();

async function loadNotifications() {
  return notificationsSupported ? import('expo-notifications') : null;
}

function toPermissionState(result: {
  granted: boolean;
  canAskAgain: boolean;
}): PermissionState {
  if (result.granted) return 'granted';
  return result.canAskAgain ? 'denied' : 'settings';
}

export function permissionLabel(kind: string, state: PermissionState) {
  if (state === 'granted') return translate('onboarding.permission.allowed', { name: kind });
  if (state === 'settings') return translate('onboarding.permission.settings', { name: kind });
  if (state === 'denied') return translate('onboarding.permission.retry', { name: kind });
  if (state === 'unsupported') return translate('onboarding.permission.devBuild', { name: kind });
  return translate('onboarding.permission.request', { name: kind });
}

export function useDevicePermissions() {
  const [camera, setCamera] = useState<PermissionState>('idle');
  const [notifications, setNotifications] = useState<PermissionState>(
    notificationsSupported ? 'idle' : 'unsupported'
  );

  useEffect(() => {
    void Camera.getCameraPermissionsAsync()
      .then((result) => setCamera(toPermissionState(result)))
      .catch(() => setCamera('idle'));
    void loadNotifications()
      .then((module) => module?.getPermissionsAsync())
      .then((result) => {
        if (result) setNotifications(toPermissionState(result));
      })
      .catch(() => setNotifications('idle'));
  }, []);

  const requestCamera = async () => {
    if (camera === 'settings') return Linking.openSettings();
    setCamera(toPermissionState(await Camera.requestCameraPermissionsAsync()));
  };

  const requestNotifications = async () => {
    if (!notificationsSupported) return;
    if (notifications === 'settings') return Linking.openSettings();
    const module = await loadNotifications();
    if (module) {
      setNotifications(toPermissionState(await module.requestPermissionsAsync()));
    }
  };

  return { camera, notifications, requestCamera, requestNotifications };
}
