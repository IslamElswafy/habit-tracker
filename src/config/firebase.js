import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// تكوين Firebase - يجب على المستخدم إضافة معلومات مشروعه الخاص
const firebaseConfig = {
  apiKey: "AIzaSyAt1jsxW968CIPtUra92EmhVerRyFodyzg",
  authDomain: "habit-tracker-558ae.firebaseapp.com",
  projectId: "habit-tracker-558ae",
  storageBucket: "habit-tracker-558ae.firebasestorage.app",
  messagingSenderId: "194787717461",
  appId: "1:194787717461:web:38deda6de061ba42b07fdc",
  measurementId: "G-ZZBEQEY6H6",
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تهيئة Firestore
export const db = getFirestore(app);

// الحصول على معرف الجهاز أو إنشاء واحد جديد
export const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId =
      "device_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};
