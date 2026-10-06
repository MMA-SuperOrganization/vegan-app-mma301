import { AppButton } from '@/components';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';

export function GoogleSignInButton() {
  const { start, isLoading } = useGoogleSignIn();

  return (
    <AppButton
      title="Tiếp tục với Google"
      variant="outline"
      loading={isLoading}
      loadingTitle="Đang kết nối Google"
      onPress={start}
    />
  );
}
