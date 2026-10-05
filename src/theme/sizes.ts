import { componentTokens } from './designTokens';
const buttonHeight = componentTokens.find((f) => f.name.startsWith('Button /'))!
  .variants[0].height;
const inputHeight = componentTokens
  .find((f) => f.name.startsWith('Input /'))!
  .variants[0].children.find((n) => n.name === 'Input surface')!.height;
export const sizes = {
  icon: { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 },
  touchTarget: { minimum: 44, comfortable: 48 },
  input: { sm: inputHeight, md: inputHeight, lg: inputHeight },
  button: { sm: buttonHeight, md: buttonHeight, lg: buttonHeight },
  avatar: { sm: 32, md: 40, lg: 56, xl: 72 },
} as const;

export type Sizes = typeof sizes;
