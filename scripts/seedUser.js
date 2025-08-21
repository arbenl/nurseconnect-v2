const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin-sdk-key.json'); // You'll need to create this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

async function seedUser() {
  const email = 'test@example.com';
  const password = 'password123';

  try {
    await auth.createUser({
      email: email,
      password: password,
    });
    console.log(`Successfully created user: ${email}`);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`User ${email} already exists.`);
    } else {
      console.error('Error creating user:', error);
    }
  }
}

seedUser();
