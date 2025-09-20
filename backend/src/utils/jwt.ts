import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development-only';
  return jwt.sign({ userId }, secret, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-for-development-only';
  return jwt.sign({ userId }, secret, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string, secret: string): any => {
  return jwt.verify(token, secret);
};
