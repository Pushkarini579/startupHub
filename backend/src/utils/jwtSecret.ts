const DEV_FALLBACK = 'startuphub_super_secret_jwt_key_2026';

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }

  console.warn('JWT_SECRET is not set. Using development fallback secret.');
  return DEV_FALLBACK;
};
