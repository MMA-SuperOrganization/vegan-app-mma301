export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
  },

  h2: {
    fontSize: 24,
    fontWeight: '700',
  },

  h3: {
    fontSize: 20,
    fontWeight: '600',
  },

  body: {
    fontSize: 16,
    fontWeight: '400',
  },

  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
  },

  caption: {
    fontSize: 12,
    fontWeight: '400',
  },

  button: {
    fontSize: 16,
    fontWeight: '600',
  },
} as const;

export type Typography = typeof typography;
