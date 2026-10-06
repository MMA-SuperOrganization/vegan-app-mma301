import { useEffect, useRef, useState } from 'react';
import { isRunningInExpoGo } from 'expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { appConfig } from '@/config';
import { AppError } from '@/services/errors';
import { useAuthStore } from '../store/authStore';

WebBrowser.maybeCompleteAuthSession();

const expoGo = isRunningInExpoGo();
const placeholderClientId = 'google-oauth-not-configured.apps.googleusercontent.com';
const googleDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

function platformClientId() {
  if (Platform.OS === 'android') return appConfig.googleAndroidClientId;
  if (Platform.OS === 'ios') return appConfig.googleIosClientId;
  return appConfig.googleWebClientId;
}

export function useGoogleSignIn() {
  const router = useRouter();
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const reportError = useAuthStore((state) => state.reportError);
  const clearError = useAuthStore((state) => state.clearError);
  const storeLoading = useAuthStore((state) => state.isLoading);
  const [isPrompting, setIsPrompting] = useState(false);
  const handledResponse = useRef<unknown>(null);
  const clientId = platformClientId();
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'veganapp',
    path: 'oauthredirect',
  });
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId ?? placeholderClientId,
      responseType: AuthSession.ResponseType.Code,
      scopes: ['openid', 'profile', 'email'],
      usePKCE: true,
      extraParams: { prompt: 'select_account' },
      redirectUri,
    },
    googleDiscovery
  );

  useEffect(() => {
    if (!response || handledResponse.current === response) return;

    if (response.type === 'success') {
      handledResponse.current = response;
      const code = response.params.code;
      if (!code || !request?.codeVerifier) {
        setIsPrompting(false);
        reportError(
          new AppError(
            'Google không trả về authorization code hợp lệ.',
            'GOOGLE_AUTH_CODE_MISSING'
          ),
          'auth.login.google.oauth',
          'Không thể nhận thông tin đăng nhập từ Google.'
        );
        return;
      }

      void AuthSession.exchangeCodeAsync(
        {
          clientId: clientId ?? placeholderClientId,
          code,
          redirectUri,
          extraParams: { code_verifier: request.codeVerifier },
        },
        googleDiscovery
      )
        .then(async (authentication) => {
          setIsPrompting(false);
          if (!authentication.idToken) {
            throw new AppError(
              'Google không trả về ID token để đăng nhập Firebase.',
              'GOOGLE_ID_TOKEN_MISSING'
            );
          }
          if (!(await loginWithGoogle(authentication.idToken, redirectUri))) return;
          const user = useAuthStore.getState().user;
          router.replace(
            user?.onboardingCompleted ? '/(tabs)' : '/(onboarding)/diet-goals'
          );
        })
        .catch((error) => {
          setIsPrompting(false);
          reportError(
            error,
            'auth.login.google.token_exchange',
            'Không thể đổi mã Google thành phiên đăng nhập.',
            'GOOGLE_TOKEN_EXCHANGE_FAILED'
          );
        });
      return;
    }

    handledResponse.current = response;
    setIsPrompting(false);
    if (response.type === 'error') {
      reportError(
        new AppError(
          response.error?.description || 'Google đã từ chối yêu cầu đăng nhập.',
          response.error?.params.error || 'GOOGLE_OAUTH_ERROR'
        ),
        'auth.login.google.oauth',
        'Không thể đăng nhập bằng Google.'
      );
    }
  }, [
    clientId,
    loginWithGoogle,
    redirectUri,
    reportError,
    request,
    response,
    router,
  ]);

  const start = async () => {
    clearError();

    if (expoGo) {
      reportError(
        new AppError(
          'Đăng nhập Google cần development build; Expo Go không hỗ trợ OAuth callback riêng của ứng dụng.',
          'GOOGLE_REQUIRES_DEV_BUILD'
        ),
        'auth.login.google.setup',
        'Không thể mở đăng nhập Google.'
      );
      return;
    }

    if (!clientId) {
      reportError(
        new AppError(
          `Thiếu Google OAuth client ID cho ${Platform.OS}.`,
          'GOOGLE_OAUTH_NOT_CONFIGURED'
        ),
        'auth.login.google.setup',
        'Đăng nhập Google chưa được cấu hình.'
      );
      return;
    }

    if (!appConfig.firebaseApiKey) {
      reportError(
        new AppError(
          'Thiếu EXPO_PUBLIC_FIREBASE_API_KEY.',
          'FIREBASE_NOT_CONFIGURED'
        ),
        'auth.login.google.setup',
        'Firebase chưa được cấu hình.'
      );
      return;
    }

    if (!request) {
      reportError(
        new AppError(
          'Yêu cầu Google OAuth chưa sẵn sàng. Vui lòng thử lại.',
          'GOOGLE_OAUTH_NOT_READY'
        ),
        'auth.login.google.oauth',
        'Đăng nhập Google chưa sẵn sàng.'
      );
      return;
    }

    handledResponse.current = null;
    setIsPrompting(true);
    try {
      await promptAsync();
    } catch (error) {
      setIsPrompting(false);
      reportError(
        error,
        'auth.login.google.oauth',
        'Không thể mở cửa sổ đăng nhập Google.',
        'GOOGLE_OAUTH_PROMPT_FAILED'
      );
    }
  };

  return {
    start,
    isLoading: isPrompting || storeLoading,
  };
}
