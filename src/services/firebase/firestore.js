import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "./config";

// Export collections
export const tasksCollection = collection(db, "tasks");
export const usersCollection = collection(db, "users");

// User profiles
export const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, "users", userId), {
      ...userData,
      updatedAt: Timestamp.now()
    });
    return { success: true, data: { id: userId, ...userData } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Tasks
export const getUserTasks = async (userId) => {
  try {
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: tasks };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createTask = async (taskData) => {
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      ...taskData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id, data: { id: docRef.id, ...taskData } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateTask = async (taskId, updates) => {
  try {
    const docRef = doc(db, "tasks", taskId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteTask = async (taskId) => {
  try {
    const docRef = doc(db, "tasks", taskId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Export as a service object for convenience
export const firestoreService = {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getUserTasks,
  createTask,
  updateTask,
  deleteTask,
  tasksCollection,
  usersCollection
};