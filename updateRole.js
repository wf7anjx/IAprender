import * as admin from "firebase-admin";
import * as fs from "fs";

// Load service account key from JSON file
const serviceAccount = JSON.parse(fs.readFileSync("./serviceAccountKey.json", "utf8"));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const updateTeacherRole = async (uid, role) => {
  try {
    await db.collection("users").doc(uid).update({
      role: role,
      updatedAt: new Date().toISOString()
    });
    console.log(`Role for user ${uid} updated to ${role} successfully.`);
  } catch (error) {
    console.error("Error updating user role:", error);
  }
};

// Replace with the actual UID of the user you want to update
const userUid = "PJOSMhHccPf7UWLqkbmU1EQfs212"; 
const newRole = "teacher";

updateTeacherRole(userUid, newRole);


