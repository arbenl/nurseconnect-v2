import { beforeAll, beforeEach, afterAll, vi } from 'vitest';
import fetch from 'node-fetch';

const FIREBASE_PROJECT_ID = 'demo-nurseconnect';
const FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8081';
const AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9098';

const clearFirestore = async () => {
  const url = `http://${FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
  await fetch(url, { method: 'DELETE' });
};

const clearAuth = async () => {
  const url = `http://${AUTH_EMULATOR_HOST}/emulator/v1/projects/${FIREBASE_PROJECT_ID}/accounts`;
  await fetch(url, { method: 'DELETE' });
};


beforeEach(async () => {
  await Promise.all([clearFirestore(), clearAuth()]);
});

afterAll(async () => {
  await Promise.all([clearFirestore(), clearAuth()]);
});
