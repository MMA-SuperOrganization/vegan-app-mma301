/** Translate known native setup failures without exposing SDK/provider messages. */
export function normalizePushRegistrationError(error: unknown): unknown {
  const nativeError = error as { code?: unknown; message?: unknown } | null;
  if (
    nativeError?.code === 'E_REGISTRATION_FAILED' &&
    typeof nativeError.message === 'string' &&
    /googleServicesFile|Default FirebaseApp|Firebase Messaging instance/i.test(
      nativeError.message
    )
  ) {
    return Object.assign(new Error('PUSH_CONFIGURATION_REQUIRED'), {
      code: 'PUSH_CONFIGURATION_REQUIRED',
    });
  }
  return error;
}
