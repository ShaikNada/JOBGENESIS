import admin from "firebase-admin";

if (!admin.apps.length) {
    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (serviceAccountJson) {
            const serviceAccount = JSON.parse(serviceAccountJson);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: process.env.FIREBASE_PROJECT_ID
            });
            console.log("✅ Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT_JSON");
        } else {
            // Falls back to Application Default Credentials
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID
            });
            console.log("✅ Firebase Admin initialized via PROJECT_ID / ADC");
        }
    } catch (e) {
        console.warn("⚠️ Firebase Admin initialization failed:", e);
    }
}

export default admin;
