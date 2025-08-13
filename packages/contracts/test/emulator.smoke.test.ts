import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
const cfg = { apiKey:'x', authDomain:'x', projectId:'demo-nurseconnect' };
test('firestore emulator write+read', async () => {
  const app = initializeApp(cfg);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  const ref = doc(db, 'smoke/test');
  await setDoc(ref, { ok: true });
  const snap = await getDoc(ref);
  expect(snap.exists()).toBe(true);
});
