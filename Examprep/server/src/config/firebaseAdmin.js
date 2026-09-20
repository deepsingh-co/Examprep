import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin without credentials to just verify tokens
// using the public Google certificates for this project.
const app = initializeApp({
  projectId: "examprep-af3d0",
});

export const adminAuth = getAuth(app);
