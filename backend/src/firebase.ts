import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Placeholder initialization. In a real environment, provide service account credentials.
if (!getApps().length) {
    try {
        // If a service account path is available, use it. Otherwise placeholder default.
        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            initializeApp({
                credential: cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
            });
        } else {
             initializeApp();
             console.warn("Firebase initialized without dedicated credentials. Defaults heavily to project defaults.");
        }
    } catch(e) {
        console.error("Firebase init failed: ", e);
    }
}

export const db = getFirestore();
export const auth = getAuth();
