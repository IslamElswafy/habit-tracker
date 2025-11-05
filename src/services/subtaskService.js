import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, getDeviceId } from '../config/firebase';
import { format } from 'date-fns';

const SUBTASK_COMPLETIONS_COLLECTION = 'subtask_completions';

// تحديد مهمة فرعية كمكتملة لليوم الحالي
export const completeSubtask = async (habitId, subtaskId, points) => {
  try {
    const deviceId = getDeviceId();
    const today = format(new Date(), 'yyyy-MM-dd');
    const completionId = `${habitId}_${subtaskId}_${today}`;
    
    const completionRef = doc(db, SUBTASK_COMPLETIONS_COLLECTION, completionId);
    
    await setDoc(completionRef, {
      habitId,
      subtaskId,
      deviceId,
      date: today,
      points,
      completedAt: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error('Error completing subtask:', error);
    throw error;
  }
};

// إلغاء إكمال مهمة فرعية
export const uncompleteSubtask = async (habitId, subtaskId) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const completionId = `${habitId}_${subtaskId}_${today}`;
    
    const completionRef = doc(db, SUBTASK_COMPLETIONS_COLLECTION, completionId);
    await deleteDoc(completionRef);
    
    return true;
  } catch (error) {
    console.error('Error uncompleting subtask:', error);
    throw error;
  }
};

// التحقق من إكمال مهمة فرعية لليوم الحالي
export const isSubtaskCompletedToday = async (habitId, subtaskId) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const completionId = `${habitId}_${subtaskId}_${today}`;
    
    const completionRef = doc(db, SUBTASK_COMPLETIONS_COLLECTION, completionId);
    const completionDoc = await getDoc(completionRef);
    
    return completionDoc.exists();
  } catch (error) {
    console.error('Error checking subtask completion:', error);
    return false;
  }
};

// الحصول على المهام الفرعية المكتملة لعادة معينة اليوم
export const getCompletedSubtasksToday = async (habitId, subtasks) => {
  try {
    const completedIds = [];
    
    for (const subtask of subtasks) {
      const isCompleted = await isSubtaskCompletedToday(habitId, subtask.id);
      if (isCompleted) {
        completedIds.push(subtask.id);
      }
    }
    
    return completedIds;
  } catch (error) {
    console.error('Error getting completed subtasks:', error);
    return [];
  }
};

