export interface LoginValidationErrors {
  email: string | null;
  password: string | null;
}

export function validateLogin(
  email: string,
  password: string
): LoginValidationErrors {
  let emailError: string | null = null;
  let passwordError: string | null = null;

  if (!email.trim()) {
    emailError = 'Please enter your email.';
  } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
    emailError = 'Please enter a valid email address.';
  }

  if (!password) {
    passwordError = 'Please enter your password.';
  } else if (password.length < 6) {
    passwordError = 'Password must be at least 6 characters.';
  }

  return { email: emailError, password: passwordError };
}
