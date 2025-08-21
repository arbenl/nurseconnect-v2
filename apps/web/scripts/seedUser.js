const axios = require('axios');
const admin = require('firebase-admin');

const AUTH_BASE = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-nurseconnect';

const signUpUrl = `http://${AUTH_BASE}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=dummy`;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
  admin.initializeApp({
    projectId: PROJECT_ID,
  });
}

const db = admin.firestore();

const seedUser = async () => {
  try {
    // Create user in Auth emulator
    const response = await axios.post(signUpUrl, {
      email: 'test@example.com',
      password: 'password123',
      returnSecureToken: true,
    });

    const authData = response.data;
    const { localId: uid } = authData;
    console.log('Successfully created auth user:', { email: 'test@example.com', uid });

    // Create user document in Firestore emulator
    await db.collection('users').doc(uid).set({
      email: 'test@example.com',
      role: 'USER',
    });

    console.log(`Successfully created Firestore document for user ${uid}`);

  } catch (error) {
    console.error('Seeding failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
};

seedUser();
