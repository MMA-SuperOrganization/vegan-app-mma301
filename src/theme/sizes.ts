export const sizes = {
  icon: { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 },
  touchTarget: { minimum: 44, comfortable: 48 },
  input: { sm: 40, md: 48, lg: 56 },
  button: { sm: 40, md: 48, lg: 56 },
  avatar: { sm: 32, md: 40, lg: 56, xl: 72 },
} as const;

export type Sizes = typeof sizes;
