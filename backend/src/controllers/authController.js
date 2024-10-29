// backend/src/controllers/authController.js
import { auth, db } from "../config/firebase.js";

export async function register(req, res) {
  try {
    const { email, password, username, uid } = req.body;

    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({
        error: "Email, password, and username are required",
      });
    }

    // Create user profile in Firestore
    await db.collection("users").doc(uid).set({
      email,
      username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({
      user: {
        id: uid,
        email: email,
        username: username,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === "auth/email-already-exists") {
      return res.status(400).json({
        error: "Email already in use",
      });
    }

    res.status(500).json({
      error: "Registration failed",
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Retrieve the ID token
    const idToken = await user.getIdToken();
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    // Verify password (Firebase Admin SDK doesn't support password auth)
    // We'll need to use a custom token
    const token = await auth.createCustomToken(userRecord.uid);

    // Get user profile from Firestore
    const userProfile = await db.collection("users").doc(userRecord.uid).get();

    // Update last login
    await db.collection("users").doc(userRecord.uid).update({
      lastLoginAt: new Date().toISOString(),
    });

    res.json({
      token,
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        username: userRecord.displayName,
        ...userProfile.data(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    res.status(500).json({
      error: "Login failed",
    });
  }
}

export async function getCurrentUser(req, res) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Get user profile from Firestore
    const userProfile = await db
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!userProfile.exists) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      user: {
        id: decodedToken.uid,
        email: decodedToken.email,
        username: decodedToken.name,
        ...userProfile.data(),
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(401).json({
      error: "Invalid token",
    });
  }
}
