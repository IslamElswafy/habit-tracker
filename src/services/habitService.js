import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { db, getDeviceId } from "../config/firebase";
import { format } from "date-fns";

const HABITS_COLLECTION = "habits";
const COMPLETIONS_COLLECTION = "completions";

// الحصول على جميع العادات للجهاز الحالي
export const getHabits = async () => {
  try {
    const deviceId = getDeviceId();
    const habitsRef = collection(db, HABITS_COLLECTION);
    const q = query(habitsRef, where("deviceId", "==", deviceId));
    const querySnapshot = await getDocs(q);

    const habits = [];
    querySnapshot.forEach((doc) => {
      habits.push({ id: doc.id, ...doc.data() });
    });

    return habits;
  } catch (error) {
    console.error("Error getting habits:", error);
    return [];
  }
};

// إضافة عادة جديدة
export const addHabit = async (habitData) => {
  try {
    const deviceId = getDeviceId();

    // الحصول على آخر ترتيب
    const habits = await getHabits();
    const maxOrder = habits.reduce((max, h) => Math.max(max, h.order || 0), 0);

    const habitRef = doc(collection(db, HABITS_COLLECTION));

    const habit = {
      ...habitData,
      deviceId,
      createdAt: new Date().toISOString(),
      streak: 0,
      order: maxOrder + 1,
      subtasks: habitData.subtasks || [],
    };

    await setDoc(habitRef, habit);
    return { id: habitRef.id, ...habit };
  } catch (error) {
    console.error("Error adding habit:", error);
    throw error;
  }
};

// إضافة مهمة فرعية لعادة
export const addSubtask = async (habitId, subtaskData) => {
  try {
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    const habitDoc = await getDoc(habitRef);

    if (!habitDoc.exists()) {
      throw new Error("Habit not found");
    }

    const habit = habitDoc.data();
    const subtasks = habit.subtasks || [];

    const newSubtask = {
      id: "subtask_" + Date.now(),
      ...subtaskData,
      createdAt: new Date().toISOString(),
    };

    subtasks.push(newSubtask);

    await updateDoc(habitRef, { subtasks });
    return newSubtask;
  } catch (error) {
    console.error("Error adding subtask:", error);
    throw error;
  }
};

// حذف مهمة فرعية
export const deleteSubtask = async (habitId, subtaskId) => {
  try {
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    const habitDoc = await getDoc(habitRef);

    if (!habitDoc.exists()) {
      throw new Error("Habit not found");
    }

    const habit = habitDoc.data();
    const subtasks = (habit.subtasks || []).filter((st) => st.id !== subtaskId);

    await updateDoc(habitRef, { subtasks });
    return true;
  } catch (error) {
    console.error("Error deleting subtask:", error);
    throw error;
  }
};

// تحديث ترتيب العادات
export const updateHabitsOrder = async (habits) => {
  try {
    const updatePromises = habits.map((habit, index) => {
      const habitRef = doc(db, HABITS_COLLECTION, habit.id);
      return updateDoc(habitRef, { order: index });
    });

    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Error updating habits order:", error);
    throw error;
  }
};

// تحديث عادة
export const updateHabit = async (habitId, updates) => {
  try {
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    await updateDoc(habitRef, updates);
    return true;
  } catch (error) {
    console.error("Error updating habit:", error);
    throw error;
  }
};

// حذف عادة
export const deleteHabit = async (habitId) => {
  try {
    const habitRef = doc(db, HABITS_COLLECTION, habitId);
    await deleteDoc(habitRef);
    return true;
  } catch (error) {
    console.error("Error deleting habit:", error);
    throw error;
  }
};

// تحديد عادة كمكتملة لليوم الحالي
export const completeHabit = async (habitId, points, isBadHabit = false) => {
  try {
    const deviceId = getDeviceId();
    const today = format(new Date(), "yyyy-MM-dd");

    // للعادات السيئة، نضيف إكمال جديد بدلاً من استبدال القديم
    if (isBadHabit) {
      const completionRef = doc(collection(db, COMPLETIONS_COLLECTION));
      await setDoc(completionRef, {
        habitId,
        deviceId,
        date: today,
        points,
        completedAt: new Date().toISOString(),
        isRepeatable: true, // علامة للعادات القابلة للتكرار
      });
      return true;
    }

    // للعادات العادية، نستخدم النظام القديم
    const completionId = `${habitId}_${today}`;
    const completionRef = doc(db, COMPLETIONS_COLLECTION, completionId);

    await setDoc(completionRef, {
      habitId,
      deviceId,
      date: today,
      points,
      completedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("Error completing habit:", error);
    throw error;
  }
};

// إلغاء إكمال عادة لليوم الحالي
export const uncompleteHabit = async (habitId, isBadHabit = false) => {
  try {
    const today = format(new Date(), "yyyy-MM-dd");

    // للعادات السيئة، نحذف آخر إكمال
    if (isBadHabit) {
      const deviceId = getDeviceId();
      const completionsRef = collection(db, COMPLETIONS_COLLECTION);

      const q = query(
        completionsRef,
        where("deviceId", "==", deviceId),
        where("habitId", "==", habitId)
      );

      const querySnapshot = await getDocs(q);
      const todayCompletions = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date === today && data.isRepeatable === true) {
          todayCompletions.push({ id: doc.id, completedAt: data.completedAt });
        }
      });

      // ترتيب حسب الوقت واختيار الأحدث
      todayCompletions.sort(
        (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
      );

      if (todayCompletions.length > 0) {
        await deleteDoc(
          doc(db, COMPLETIONS_COLLECTION, todayCompletions[0].id)
        );
      }
      return true;
    }

    // للعادات العادية، نستخدم النظام القديم
    const completionId = `${habitId}_${today}`;
    const completionRef = doc(db, COMPLETIONS_COLLECTION, completionId);
    await deleteDoc(completionRef);

    return true;
  } catch (error) {
    console.error("Error uncompleting habit:", error);
    throw error;
  }
};

// التحقق من إكمال عادة لليوم الحالي
export const isHabitCompletedToday = async (habitId) => {
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const completionId = `${habitId}_${today}`;

    const completionRef = doc(db, COMPLETIONS_COLLECTION, completionId);
    const completionDoc = await getDoc(completionRef);

    return completionDoc.exists();
  } catch (error) {
    console.error("Error checking habit completion:", error);
    return false;
  }
};

// الحصول على عدد مرات إكمال عادة سيئة لليوم الحالي
export const getBadHabitCompletionsCountToday = async (habitId) => {
  try {
    const deviceId = getDeviceId();
    const today = format(new Date(), "yyyy-MM-dd");
    const completionsRef = collection(db, COMPLETIONS_COLLECTION);

    // استعلام بسيط ثم فلترة في JavaScript لتجنب الحاجة لـ index مركب
    const q = query(
      completionsRef,
      where("deviceId", "==", deviceId),
      where("habitId", "==", habitId)
    );

    const querySnapshot = await getDocs(q);
    let count = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.date === today && data.isRepeatable === true) {
        count++;
      }
    });

    return count;
  } catch (error) {
    console.error("Error getting bad habit completions count:", error);
    return 0;
  }
};

// الحصول على إجمالي النقاط من عادة سيئة لليوم الحالي
export const getBadHabitPointsToday = async (habitId, pointsPerCompletion) => {
  try {
    const count = await getBadHabitCompletionsCountToday(habitId);
    return count * pointsPerCompletion;
  } catch (error) {
    console.error("Error getting bad habit points:", error);
    return 0;
  }
};

// الحصول على سجل الإنجاز لفترة معينة
export const getCompletions = async (startDate, endDate) => {
  try {
    const deviceId = getDeviceId();
    const completionsRef = collection(db, COMPLETIONS_COLLECTION);

    // استعلام بسيط بدون index مركب - نحصل على كل إنجازات الجهاز
    const q = query(completionsRef, where("deviceId", "==", deviceId));

    const querySnapshot = await getDocs(q);

    const startDateStr = format(startDate, "yyyy-MM-dd");
    const endDateStr = format(endDate, "yyyy-MM-dd");

    // فلترة التواريخ في JavaScript بدلاً من Firestore
    const completions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.date >= startDateStr && data.date <= endDateStr) {
        completions.push({ id: doc.id, ...data });
      }
    });

    return completions;
  } catch (error) {
    console.error("Error getting completions:", error);
    return [];
  }
};

// حساب الـ streak (عدد الأيام المتتالية) لعادة معينة
export const calculateStreak = async (habitId) => {
  try {
    const deviceId = getDeviceId();
    const completionsRef = collection(db, COMPLETIONS_COLLECTION);

    // استخدام استعلام بسيط بدون orderBy لتجنب الحاجة إلى index مركب
    // سنقوم بالترتيب في JavaScript بدلاً من ذلك
    const q = query(
      completionsRef,
      where("deviceId", "==", deviceId),
      where("habitId", "==", habitId)
    );

    const querySnapshot = await getDocs(q);

    // الحصول على التواريخ الفريدة فقط (للعادات السيئة قد يكون هناك عدة إكمالات في نفس اليوم)
    const uniqueDates = new Set();
    querySnapshot.forEach((doc) => {
      uniqueDates.add(doc.data().date);
    });

    if (uniqueDates.size === 0) return 0;

    // تحويل التواريخ إلى مصفوفة وترتيبها (من الأحدث للأقدم)
    const dates = Array.from(uniqueDates).sort((a, b) => b.localeCompare(a));

    // حساب الـ streak: نبدأ من اليوم ونتحقق من الأيام المتتالية
    const today = format(new Date(), "yyyy-MM-dd");
    let streak = 0;

    // نبدأ من اليوم إذا كان هناك إكمال اليوم، وإلا نبدأ من أمس
    let currentDate = today;
    if (!dates.includes(today)) {
      // إذا لم يكن هناك إكمال اليوم، نبدأ من أمس
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      currentDate = format(yesterday, "yyyy-MM-dd");
    }

    // التحقق من الأيام المتتالية (نرجع للخلف من اليوم/أمس)
    while (dates.includes(currentDate)) {
      streak++;
      // حساب التاريخ السابق
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      currentDate = format(prevDate, "yyyy-MM-dd");
    }

    return streak;
  } catch (error) {
    console.error("Error calculating streak:", error);
    return 0;
  }
};
