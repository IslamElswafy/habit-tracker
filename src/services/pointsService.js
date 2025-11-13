import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, getDeviceId } from "../config/firebase";
import { format } from "date-fns";

const POINTS_COLLECTION = "userPoints";
const COMPLETIONS_COLLECTION = "completions";

// الحصول على رصيد النقاط المتراكمة للمستخدم
export const getPointsBalance = async () => {
  try {
    const deviceId = getDeviceId();
    const pointsRef = doc(db, POINTS_COLLECTION, deviceId);
    const pointsDoc = await getDoc(pointsRef);

    if (pointsDoc.exists()) {
      return pointsDoc.data().balance || 0;
    }

    // إذا لم يكن هناك رصيد، قم بإنشاء واحد جديد
    await setDoc(pointsRef, {
      deviceId,
      balance: 0,
      lastUpdated: new Date().toISOString(),
    });

    return 0;
  } catch (error) {
    console.error("Error getting points balance:", error);
    return 0;
  }
};

// تحديث رصيد النقاط
export const updatePointsBalance = async (pointsChange) => {
  try {
    const deviceId = getDeviceId();
    const pointsRef = doc(db, POINTS_COLLECTION, deviceId);
    const pointsDoc = await getDoc(pointsRef);

    let currentBalance = 0;
    if (pointsDoc.exists()) {
      currentBalance = pointsDoc.data().balance || 0;
    }

    const newBalance = Math.max(0, currentBalance + pointsChange); // لا يمكن أن يكون الرصيد سالباً

    if (pointsDoc.exists()) {
      await updateDoc(pointsRef, {
        balance: newBalance,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      await setDoc(pointsRef, {
        deviceId,
        balance: newBalance,
        lastUpdated: new Date().toISOString(),
      });
    }

    return newBalance;
  } catch (error) {
    console.error("Error updating points balance:", error);
    throw error;
  }
};

// حساب النقاط من الإنجازات اليومية وتحديث الرصيد
export const syncPointsFromCompletions = async () => {
  try {
    const deviceId = getDeviceId();
    const completionsRef = collection(db, COMPLETIONS_COLLECTION);
    const q = query(completionsRef, where("deviceId", "==", deviceId));
    const querySnapshot = await getDocs(q);

    let totalPoints = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalPoints += data.points || 0;
    });

    // تحديث الرصيد
    const pointsRef = doc(db, POINTS_COLLECTION, deviceId);
    const pointsDoc = await getDoc(pointsRef);

    if (pointsDoc.exists()) {
      await updateDoc(pointsRef, {
        balance: Math.max(0, totalPoints),
        lastUpdated: new Date().toISOString(),
      });
    } else {
      await setDoc(pointsRef, {
        deviceId,
        balance: Math.max(0, totalPoints),
        lastUpdated: new Date().toISOString(),
      });
    }

    return Math.max(0, totalPoints);
  } catch (error) {
    console.error("Error syncing points from completions:", error);
    throw error;
  }
};

// خصم نقاط لشراء جائزة
export const deductPoints = async (amount) => {
  try {
    const currentBalance = await getPointsBalance();

    if (currentBalance < amount) {
      throw new Error("رصيد النقاط غير كافٍ");
    }

    return await updatePointsBalance(-amount);
  } catch (error) {
    console.error("Error deducting points:", error);
    throw error;
  }
};
