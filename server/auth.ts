import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { AdminSessionUser } from '../src/types.ts';

const COOKIE_NAME = 'w18_admin_session';

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    'win18-ultra-dev-session-secret-change-in-production'
  );
}

function getExpectedCredentials(): { username: string; passwordHash: string; salt: string } {
  const username = process.env.ADMIN_USERNAME || 'anshraj';
  const password = process.env.ADMIN_PASSWORD || 'Win18Ultra#Admin2026';
  const salt = 'w18-ultra-static-dev-salt';
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return { username, passwordHash: derived, salt };
}

export function verifyAdminPassword(username: string, password: string): AdminSessionUser | null {
  const expected = getExpectedCredentials();
  if (username.trim().toLowerCase() !== expected.username.toLowerCase()) {
    return null;
  }
  const candidate = crypto.scryptSync(password, expected.salt, 64);
  const target = Buffer.from(expected.passwordHash, 'hex');
  if (candidate.length !== target.length) return null;
  if (!crypto.timingSafeEqual(candidate, target)) {
    return null;
  }
  return {
    username: expected.username,
    role: 'super_admin',
  };
}

export function createSessionToken(user: AdminSessionUser): string {
  const payload = {
    username: user.username,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 8, // 8 hours
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string | undefined): AdminSessionUser | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;
  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
      username: string;
      role: 'super_admin' | 'release_manager';
      exp: number;
    };
    if (!parsed.exp || Date.now() > parsed.exp) return null;
    return { username: parsed.username, role: parsed.role };
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  adminUser?: AdminSessionUser;
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;
  const user = verifySessionToken(token);
  if (!user) {
    res.status(401).json({ error: 'Authentication required. Please sign in as Administrator.' });
    return;
  }
  req.adminUser = user;
  next();
}

export function requireRole(allowed: Array<'super_admin' | 'release_manager'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser || !allowed.includes(req.adminUser.role)) {
      res.status(403).json({ error: 'Insufficient role permissions for this operation.' });
      return;
    }
    next();
  };
}

export { COOKIE_NAME };
