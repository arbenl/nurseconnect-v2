import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { onCall } from "firebase-functions/v2/https";
import { log } from "./lib/logger";
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
export const helloWorld = onRequest((request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});
export const createRequest = onCall((request) => {
    const { patientId, location } = request.data;
    const requestId = "some-random-uuid"; // In a real app, you'd generate a UUID
    log.info({
        requestId,
        patientId,
        location,
        route: 'createRequest'
    }, "New request created");
    // ... rest of the function logic
    return {
        success: true,
        requestId,
    };
});
// This is where you will add your core backend functions like:
// exports.assignNearestNurse = ...
// exports.onUserCreate = ...
