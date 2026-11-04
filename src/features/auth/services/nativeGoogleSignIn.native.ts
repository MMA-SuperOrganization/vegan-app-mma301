import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

/**
 * Returns null when the account picker is cancelled and undefined when Google
 * succeeds without the ID token required by Firebase.
 */
export async function requestNativeGoogleIdToken(
  webClientId: string
): Promise<string | null | undefined> {
  GoogleSignin.configure({ webClientId });

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
  }

  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) return null;
  return response.data.idToken ?? undefined;
}
