import { AppButton, AppText } from '@/components/ui';
import { LoadingSpinner } from './LoadingSpinner';
import { getUserErrorMessage } from '@/services/errors';
import { useTranslation } from '@/i18n';
import { View } from 'react-native';
import { colors, spacing } from '@/theme';

export function FeatureState({
  loading,
  error,
  retry,
}: {
  loading?: boolean;
  error?: unknown;
  retry?: () => void;
}) {
  const { t, locale } = useTranslation();
  const code =
    (error as { code?: string; message?: string })?.code ||
    (error instanceof Error ? error.message : '');
  const messages: Record<string, [string, string]> = {
    PUSH_CONFIGURATION_REQUIRED: [
      'Bản Android này chưa được cấu hình nhận thông báo. Vui lòng liên hệ hỗ trợ để cập nhật ứng dụng.',
      'Push notifications are not configured in this Android build. Contact support for an app update.',
    ],
    AI_DISABLED: [
      'Dịch vụ AI chưa được bật trên máy chủ.',
      'AI is not enabled on the server.',
    ],
    AI_UNAVAILABLE: [
      'Dịch vụ AI hiện chưa sẵn sàng. Vui lòng thử lại sau.',
      'AI is currently unavailable. Please try again later.',
    ],
    AI_PROVIDER_ERROR: [
      'Chưa thể tạo kết quả AI. Vui lòng thử lại.',
      'AI could not complete the request. Please retry.',
    ],
    AI_INVALID_OUTPUT: [
      'Kết quả AI chưa hợp lệ. Vui lòng tạo đề xuất mới.',
      'AI returned an invalid result. Please generate a new proposal.',
    ],
    CAMERA_PERMISSION_REQUIRED: [
      'Cần cấp quyền máy ảnh để chụp nguyên liệu.',
      'Allow camera access to photograph ingredients.',
    ],
    NOTIFICATION_PERMISSION_REQUIRED: [
      'Cần cấp quyền thông báo trong cài đặt thiết bị.',
      'Allow notifications in your device settings.',
    ],
    UNSUPPORTED_IMAGE: [
      'Chọn ảnh JPEG, PNG hoặc WebP.',
      'Choose a JPEG, PNG or WebP image.',
    ],
    UNSUPPORTED_VIDEO: ['Chọn video MP4 hoặc WebM.', 'Choose an MP4 or WebM video.'],
    AI_VIDEO_UNSUPPORTED: [
      'Nhà cung cấp AI cần bản lời thoại để tóm tắt video.',
      'The AI provider requires a transcript to summarize this video.',
    ],
    UPLOAD_FAILED: [
      'Tải ảnh thất bại. Vui lòng thử lại.',
      'Image upload failed. Please retry.',
    ],
    FCM_TOKEN_CONFLICT: [
      'Thiết bị đang đăng ký với tài khoản khác. Hãy tắt push ở tài khoản đó trước.',
      'This device is registered to another account. Unregister push from that account first.',
    ],
  };
  if (loading) return <LoadingSpinner text={t('common.loading')} />;
  if (!error) return null;
  return (
    <View style={{ gap: spacing.sm }} accessibilityRole="alert">
      <AppText color={colors.status.danger}>
        {messages[code]?.[locale === 'vi' ? 0 : 1] || getUserErrorMessage(error)}
      </AppText>
      {retry ? (
        <AppButton title={t('common.retry')} variant="outline" onPress={retry} />
      ) : null}
    </View>
  );
}
