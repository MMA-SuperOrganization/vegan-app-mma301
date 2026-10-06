import axios from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      { error?: { message?: string; code?: string } } | undefined;
    const code = payload?.error?.code;
    const status = error.response?.status;
    const backendMessages: Record<string, string> = {
      ACCOUNT_DISABLED: 'Tài khoản đã bị vô hiệu hóa.',
      ACCOUNT_SUSPENDED: 'Tài khoản đang bị tạm khóa.',
      ACCOUNT_DELETED: 'Tài khoản không còn hoạt động.',
      TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn.',
      TOKEN_INVALID: 'Phiên đăng nhập không hợp lệ.',
      ONBOARDING_INCOMPLETE: 'Bạn cần hoàn thành đủ thông tin trước khi tiếp tục.',
      TRANSACTIONS_REQUIRED:
        'Máy chủ chưa sẵn sàng lưu hồ sơ. Vui lòng thử lại sau.',
    };
    return {
      message:
        (code && backendMessages[code]) ||
        payload?.error?.message ||
        (status
          ? `Yêu cầu thất bại (${status}).`
          : 'Không thể kết nối tới máy chủ.'),
      status,
      code,
    };
  }

  return {
    message: error instanceof Error ? error.message : 'Đã có lỗi không mong muốn.',
  };
}
