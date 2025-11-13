import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, getDeviceId } from "../config/firebase";
import { deductPoints } from "./pointsService";

const REWARDS_COLLECTION = "rewards";

// بيانات الجوائز الافتراضية
export const DEFAULT_REWARDS = [
  // مكافآت جيدة
  {
    title: "مشاهدة فيلم",
    description: "استمتع بمشاهدة فيلم مفضل",
    category: "good",
    cost: 50,
    icon: "🎬",
  },
  {
    title: "أكلة مفضلة",
    description: "تناول وجبتك المفضلة",
    category: "good",
    cost: 60,
    icon: "🍕",
  },
  {
    title: "يوم راحة",
    description: "استمتع بيوم راحة كامل",
    category: "good",
    cost: 80,
    icon: "😴",
  },
  {
    title: "شراء شيء صغير",
    description: "اشتري شيئاً صغيراً تحبه",
    category: "good",
    cost: 100,
    icon: "🛍️",
  },
  {
    title: "خروج مع الأصدقاء",
    description: "اقضِ وقتاً ممتعاً مع الأصدقاء",
    category: "good",
    cost: 150,
    icon: "👥",
  },
  // مكافآت محايدة
  {
    title: "ساعة ألعاب",
    description: "لعب ألعاب لمدة ساعة (25-40 نقطة)",
    category: "neutral",
    cost: 30, // متوسط السعر
    costRange: { min: 25, max: 40 },
    icon: "🎮",
  },
  {
    title: "مشاهدة أنمي",
    description: "مشاهدة أنمي (20-30 نقطة)",
    category: "neutral",
    cost: 25, // متوسط السعر
    costRange: { min: 20, max: 30 },
    icon: "📺",
  },
  {
    title: "سوشيال ميديا 30 دقيقة",
    description: "استخدام السوشيال ميديا لمدة 30 دقيقة (10-15 نقطة)",
    category: "neutral",
    cost: 12, // متوسط السعر
    costRange: { min: 10, max: 15 },
    icon: "📱",
  },
];

// الحصول على جميع الجوائز
export const getRewards = async () => {
  try {
    const deviceId = getDeviceId();
    const rewardsRef = collection(db, REWARDS_COLLECTION);
    const q = query(
      rewardsRef,
      where("deviceId", "==", deviceId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const rewards = [];
    querySnapshot.forEach((doc) => {
      rewards.push({ id: doc.id, ...doc.data() });
    });

    // إذا لم تكن هناك جوائز، أضف الجوائز الافتراضية
    if (rewards.length === 0) {
      return DEFAULT_REWARDS.map((reward, index) => ({
        ...reward,
        id: `default_${index}`,
        isDefault: true,
      }));
    }

    return rewards;
  } catch (error) {
    console.error("Error getting rewards:", error);
    // في حالة الخطأ، أرجع الجوائز الافتراضية
    return DEFAULT_REWARDS.map((reward, index) => ({
      ...reward,
      id: `default_${index}`,
      isDefault: true,
    }));
  }
};

// شراء جائزة
export const purchaseReward = async (rewardId, rewardCost) => {
  try {
    // خصم النقاط
    const newBalance = await deductPoints(rewardCost);

    // تسجيل عملية الشراء
    const deviceId = getDeviceId();
    const purchaseRef = doc(collection(db, "rewardPurchases"));
    await setDoc(purchaseRef, {
      deviceId,
      rewardId,
      cost: rewardCost,
      purchasedAt: new Date().toISOString(),
    });

    return newBalance;
  } catch (error) {
    console.error("Error purchasing reward:", error);
    throw error;
  }
};

// الحصول على سجل المشتريات
export const getPurchaseHistory = async () => {
  try {
    const deviceId = getDeviceId();
    const purchasesRef = collection(db, "rewardPurchases");
    const q = query(
      purchasesRef,
      where("deviceId", "==", deviceId),
      orderBy("purchasedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const purchases = [];
    querySnapshot.forEach((doc) => {
      purchases.push({ id: doc.id, ...doc.data() });
    });

    return purchases;
  } catch (error) {
    console.error("Error getting purchase history:", error);
    return [];
  }
};
