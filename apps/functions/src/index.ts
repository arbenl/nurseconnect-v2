import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();

// HTTP test endpoint
export const hello = functions.https.onRequest((req, res) => {
  res.status(200).send("Hello from NurseConnect Functions");
});

// Auth user provisioning (runs on new signups)
export const onAuthCreate = functions.auth.user().onCreate(async (user) => {
  const db = getFirestore();
  await db.doc(`users/${user.uid}`).set(
    {
      role: "patient",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
});