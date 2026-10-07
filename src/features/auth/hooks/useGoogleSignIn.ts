import { useEffect, useRef, useState } from 'react';
import { isRunningInExpoGo } from 'expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { appConfig } from '@/config';
import { AppError } from '@/services/errors';
import { translate } from '@/i18n';
import { useAuthStore } from '../store/authStore';

WebBrowser.maybeCompleteAuthSession();

const expoGo = isRunningInExpoGo();
const placeholderClientId = 'google-oauth-not-configured.apps.googleusercontent.com';
const googleDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export function useGoogleSignIn() {
  const router = useRouter();
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const reportError = useAuthStore((state) => state.reportError);
  const clearError = useAuthStore((state) => state.clearError);
  const storeLoading = useAuthStore((state) => state.isLoading);
  const [isPrompting, setIsPrompting] = useState(false);
  const handledResponse = useRef<unknown>(null);
  const webClientId = appConfig.googleWebClientId;
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'veganapp',
    path: 'oauthredirect',
  });
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: webClientId ?? placeholderClientId,
      responseType: AuthSession.ResponseType.Code,
      scopes: ['openid', 'profile', 'email'],
      usePKCE: true,
      extraParams: { prompt: 'select_account' },
      redirectUri,
    },
    googleDiscovery
  );

  const finishLogin = async (idToken: string, requestUri: string) => {
    if (!(await loginWithGoogle(idToken, requestUri))) return;
    const user = useAuthStore.getState().user;
    router.replace(user?.onboardingCompleted ? '/(tabs)' : '/(onboarding)/diet-goals');
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || !response || handledResponse.current === response) {
      return;
    }

    if (response.type === 'success') {
      handledResponse.current = response;
      const code = response.params.code;
      if (!code || !request?.codeVerifier) {
        setIsPrompting(false);
        reportError(
          new AppError(
            translate('auth.google.authCodeMissing'),
            'GOOGLE_AUTH_CODE_MISSING'
          ),
          'auth.login.google.oauth',
          translate('auth.google.receiveFailed')
        );
        return;
      }

      void AuthSession.exchangeCodeAsync(
        {
          clientId: webClientId ?? placeholderClientId,
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
              translate('auth.google.firebaseTokenMissing'),
              'GOOGLE_ID_TOKEN_MISSING'
            );
          }
          await finishLogin(authentication.idToken, redirectUri);
        })
        .catch((error) => {
          setIsPrompting(false);
          reportError(
            error,
            'auth.login.google.token_exchange',
            translate('auth.google.exchangeFailed'),
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
          response.error?.description || translate('auth.google.denied'),
          response.error?.params.error || 'GOOGLE_OAUTH_ERROR'
        ),
        'auth.login.google.oauth',
        translate('auth.error.googleLogin')
      );
    }
  }, [redirectUri, reportError, request, response, webClientId]);

  const startNative = async () => {
    if (expoGo) {
      throw new AppError(
        translate('auth.google.requiresBuild'),
        'GOOGLE_REQUIRES_DEV_BUILD'
      );
    }

    if (!webClientId) {
      throw new AppError(
        translate('auth.google.webClientMissing'),
        'GOOGLE_OAUTH_NOT_CONFIGURED'
      );
    }

    const google = await import('@react-native-google-signin/google-signin');
    google.GoogleSignin.configure({ webClientId });
    if (Platform.OS === 'android') {
      await google.GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    }
    const result = await google.GoogleSignin.signIn();
    if (!google.isSuccessResponse(result)) return;
    if (!result.data.idToken) {
      throw new AppError(
        translate('auth.google.idTokenMissing'),
        'GOOGLE_ID_TOKEN_MISSING'
      );
    }

    // Firebase REST requires this field, but the native SDK already completed
    // the real Google callback before this request is sent.
    await finishLogin(result.data.idToken, 'http://localhost');
  };

  const startWeb = async () => {
    if (!webClientId) {
      throw new AppError(
        translate('auth.google.webClientMissing'),
        'GOOGLE_OAUTH_NOT_CONFIGURED'
      );
    }
    if (!request) {
      throw new AppError(
        translate('auth.google.notReady'),
        'GOOGLE_OAUTH_NOT_READY'
      );
    }
    handledResponse.current = null;
    await promptAsync();
  };

  const start = async () => {
    clearError();

    if (!appConfig.firebaseApiKey) {
      reportError(
        new AppError(translate('auth.google.firebaseKeyMissing'), 'FIREBASE_NOT_CONFIGURED'),
        'auth.login.google.setup',
        translate('auth.google.firebaseNotConfigured')
      );
      return;
    }

    setIsPrompting(true);
    try {
      if (Platform.OS === 'web') await startWeb();
      else await startNative();
    } catch (error) {
      reportError(
        error,
        'auth.login.google.oauth',
        translate('auth.google.openFailed'),
        'GOOGLE_OAUTH_PROMPT_FAILED'
      );
    } finally {
      if (Platform.OS !== 'web') setIsPrompting(false);
    }
  };

  return {
    start,
    isLoading: isPrompting || storeLoading,
  };
}
