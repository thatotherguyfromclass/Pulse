import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";


/**
 * SIGNUP USER + CREATE WORKSPACE
 */
export const signup = async (email, password, name, currency) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user workspace in Firestore with currency
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      currency: currency || "₦",
      subscriptionStatus: "free",
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      createdAt: serverTimestamp()
    });

    return { user, error: null };
  } catch (error) {
    // Map Firebase errors to friendly messages
    let errorMessage = "Signup failed";
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "This email is already in use.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
      case "auth/weak-password":
        errorMessage = "Password should be at least 6 characters.";
        break;
      default:
        errorMessage = error.message;
    }
    return { user: null, error: errorMessage };
  }
};

/**
 * LOGIN USER
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    let errorMessage = "Login failed";
    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email.";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
      case "auth/invalid-credential":
        errorMessage = "Invalid login credentials. Please check your email and password.";
        break;
      default:
        errorMessage = error.message;
    }
    return { user: null, error: errorMessage };
  }
};

/**
 * LOGOUT
 */
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * RESET PASSWORD
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error) {
    let errorMessage = "Failed to send reset email";
    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
      case "auth/invalid-credential":
        errorMessage = "Invalid credentials. Please check your email.";
        break;
      default:
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
};
