import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const serviceAccount = require("../serviceAccountKey.json");

export function initializeFirebase() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}
initializeFirebase();
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();
