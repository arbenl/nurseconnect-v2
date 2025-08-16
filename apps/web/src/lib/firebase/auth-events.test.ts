/// <reference types="vitest/globals" />
import { describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest';
import { adminDb } from './admin';
import { onUserSignIn } from './auth-events';
import type { User } from 'next-auth';

// Keep the module shape but allow overriding return values per test
vi.mock('./admin', () => ({
  adminDb: {
    collection: vi.fn(() => ({
      doc: vi.fn((docId: string) => ({
        id: docId,
        get: vi.fn(),
        set: vi.fn(),
      })),
    })),
  },
}));

describe('Auth Events', () => {
  it('should create a user profile on first sign-in', async () => {
    const user: User = {
      id: 'test-user-123',
      name: 'Test User',
      email: 'test@example.com',
    };

    // Create and configure a single docRef instance…
    const docRef = {
      id: user.id,
      get: vi.fn().mockResolvedValue({ exists: false }),
      set: vi.fn(),
    };

    // …and make the adminDb mock return THIS exact instance when called
    (adminDb.collection as Mock).mockReturnValue({
      doc: vi.fn().mockReturnValue(docRef),
    });

    await onUserSignIn({ user });

    expect(adminDb.collection).toHaveBeenCalledWith('users');
    expect(docRef.get).toHaveBeenCalled();
    expect(docRef.set).toHaveBeenCalledWith({
      uid: user.id,
      email: user.email,
      displayName: user.name,
      roles: ['viewer'],
      createdAt: expect.any(Date),
    });
  });

  it('should not overwrite an existing user profile', async () => {
    const user: User = {
      id: 'existing-user-456',
      email: 'existing@example.com',
    };

    const docRef = {
      id: user.id,
      get: vi.fn().mockResolvedValue({ exists: true }),
      set: vi.fn(),
    };

    (adminDb.collection as Mock).mockReturnValue({
      doc: vi.fn().mockReturnValue(docRef),
    });

    await onUserSignIn({ user });

    expect(docRef.get).toHaveBeenCalled();
    expect(docRef.set).not.toHaveBeenCalled();
  });
});