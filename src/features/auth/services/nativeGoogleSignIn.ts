export async function requestNativeGoogleIdToken(
  _webClientId: string
): Promise<string | null | undefined> {
  throw new Error('Native Google Sign-In is unavailable on this platform.');
}
