export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Vui lòng nhập email.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Email không hợp lệ.';
  return null;
}

export function validateLogin(email: string, password: string) {
  return {
    email: validateEmail(email),
    password: password ? null : 'Vui lòng nhập mật khẩu.',
  };
}

export function validateRegistration(
  name: string,
  email: string,
  password: string,
  confirmation: string
) {
  return {
    name: name.trim() ? null : 'Vui lòng nhập tên hiển thị.',
    email: validateEmail(email),
    password: password.length >= 6 ? null : 'Mật khẩu phải có ít nhất 6 ký tự.',
    confirmation:
      confirmation && confirmation === password
        ? null
        : 'Mật khẩu xác nhận chưa khớp.',
  };
}
