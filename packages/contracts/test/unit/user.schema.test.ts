import { describe, it, expect } from 'vitest';
import { UserProfile } from '../../src/user';

describe('UserProfile schema', () => {
  it('accepts valid payload', () => {
    const p = UserProfile.parse({
      uid: 'abc',
      email: 'a@b.com',
      displayName: 'A',
      roles: ['staff'],
      createdAt: new Date().toISOString(),
    });
    expect(p.uid).toBe('abc');
  });

  it('rejects bad email', () => {
    expect(() =>
      UserProfile.parse({
        uid: '1',
        email: 'no',
        displayName: 'x',
        roles: ['staff'],
        createdAt: '2020-01-01T00:00:00Z',
      })
    ).toThrowError();
  });
});