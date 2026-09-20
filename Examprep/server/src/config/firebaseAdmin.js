import admin from "firebase-admin";

// Initialize Firebase Admin without credentials to just verify tokens
// using the public Google certificates for this project.
admin.initializeApp({
  projectId: "examprep-af3d0",
});

export default admin;
