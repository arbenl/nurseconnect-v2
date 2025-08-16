process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
import { describe, it, expect } from 'vitest';
import middleware, { config } from './middleware';

describe('Middleware', () => {
  it('exports a function', () => {
    expect(typeof middleware).toBe('function');
  });

  it('protects dashboard paths', () => {
    expect(config?.matcher).toEqual(['/dashboard/:path*']);
  });
});