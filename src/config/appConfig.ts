const DEFAULT_API_URL = 'https://vegan-api.ngocthang.io.vn/api/v1';

function optional(value: string | undefined) {
  return value?.trim() || undefined;
}

export const appConfig = Object.freeze({
  apiBaseUrl: (optional(process.env.EXPO_PUBLIC_API_URL) ?? DEFAULT_API_URL).replace(
    /\/+$/,
    ''
  ),
  firebaseApiKey: optional(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
  googleWebClientId: optional(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
  googleAndroidClientId: optional(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID),
  googleIosClientId: optional(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
  privacyPolicyUrl: optional(process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL),
});
