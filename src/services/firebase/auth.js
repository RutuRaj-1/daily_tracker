import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "./config";
import { createUserProfile } from "./firestore";

// Export as firebaseAuth object
export const firebaseAuth = {
  signUp: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await createUserProfile(userCredential.user.uid, {
        email,
        displayName,
        createdAt: new Date().toISOString(),
        settings: {
          theme: 'light',
          notifications: true,
          workPreference: 'morning',
          goalEndDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]
        }
      });
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser: () => {
    return auth.currentUser;
  }
};

// Also export individual functions if needed
export const signUp = firebaseAuth.signUp;
export const signIn = firebaseAuth.signIn;
export const signOutUser = firebaseAuth.signOut;
export const resetPassword = firebaseAuth.resetPassword;