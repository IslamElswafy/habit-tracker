import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Flame } from 'lucide-react';
import { HABIT_CATEGORIES } from '../config/categories';
import { updateHabit, calculateStreak } from '../services/habitService';
import { completeHabit, uncompleteHabit, isHabitCompletedToday, getBadHabitCompletionsCountToday } from '../services/habitService';
import { updatePointsBalance } from '../services/pointsService';

const EditHabitModal = ({ isOpen, onClose, habit, onHabitUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'religious',
    points: 10,
  });
  const [subtasks, setSubtasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionCount, setCompletionCount] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (habit) {
      setFormData({
        title: habit.title || '',
        description: habit.description || '',
        category: habit.category || 'religious',
        points: habit.points || 10,
      });
      setSubtasks(habit.subtasks || []);
      
      // تحميل حالة الإكمال والـ streak
      const loadCompletionStatus = async () => {
        const isBadHabit = habit.category === "bad";
        try {
          if (isBadHabit) {
            const count = await getBadHabitCompletionsCountToday(habit.id);
            setCompletionCount(count);
            setIsCompleted(count > 0);
          } else {
            const completed = await isHabitCompletedToday(habit.id);
            setIsCompleted(completed);
          }
          
          // تحميل الـ streak
          const currentStreak = await calculateStreak(habit.id);
          setStreak(currentStreak);
        } catch (error) {
          console.error('Error loading completion status:', error);
        }
      };
      
      loadCompletionStatus();
    }
  }, [habit]);

  // تحديث حالة الإكمال عند تغيير الفئة (فقط إذا تغيرت الفئة وليس عند التحميل الأول)
  useEffect(() => {
    if (habit && formData.category !== habit.category) {
      const loadCompletionStatus = async () => {
        const isBadHabit = formData.category === "bad";
        try {
          if (isBadHabit) {
            const count = await getBadHabitCompletionsCountToday(habit.id);
            setCompletionCount(count);
            setIsCompleted(count > 0);
          } else {
            const completed = await isHabitCompletedToday(habit.id);
            setIsCompleted(completed);
            setCompletionCount(0);
          }
          
          // إعادة حساب الـ streak
          const currentStreak = await calculateStreak(habit.id);
          setStreak(currentStreak);
        } catch (error) {
          console.error('Error loading completion status:', error);
        }
      };
      
      loadCompletionStatus();
    }
  }, [formData.category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const updates = {
        ...formData,
        subtasks,
      };
      await updateHabit(habit.id, updates);
      
      // إعادة حساب الـ streak بعد التحديث
      const newStreak = await calculateStreak(habit.id);
      setStreak(newStreak);
      
      onHabitUpdated({ ...habit, ...updates, streak: newStreak });
      onClose();
    } catch (error) {
      console.error('Error updating habit:', error);
      alert('حدث خطأ أثناء تحديث العادة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCompletion = async () => {
    if (!habit) return;
    
    const isBadHabit = formData.category === "bad";
    const newCompleted = !isCompleted;
    const points = formData.points;
    
    try {
      if (newCompleted) {
        await completeHabit(habit.id, points, isBadHabit);
        await updatePointsBalance(points);
        
        if (isBadHabit) {
          const newCount = await getBadHabitCompletionsCountToday(habit.id);
          setCompletionCount(newCount);
        }
      } else {
        await uncompleteHabit(habit.id, isBadHabit);
        await updatePointsBalance(-points);
        
        if (isBadHabit) {
          const newCount = await getBadHabitCompletionsCountToday(habit.id);
          setCompletionCount(newCount);
        }
      }
      
      setIsCompleted(newCompleted);
      
      // إعادة حساب الـ streak
      const newStreak = await calculateStreak(habit.id);
      setStreak(newStreak);
      
      // تحديث العادة في القائمة الرئيسية مع الـ streak المحدث
      if (onHabitUpdated) {
        onHabitUpdated({ ...habit, ...formData, streak: newStreak });
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      alert('حدث خطأ أثناء تفعيل/إلغاء تفعيل العادة');
    }
  };

  const handleAddAnother = async () => {
    if (!habit || formData.category !== "bad") return;
    
    const points = formData.points;
    
    try {
      await completeHabit(habit.id, points, true);
      await updatePointsBalance(points);
      
      // إعادة تحميل عدد المرات
      const newCount = await getBadHabitCompletionsCountToday(habit.id);
      setCompletionCount(newCount);
      setIsCompleted(true);
      
      // إعادة حساب الـ streak
      const newStreak = await calculateStreak(habit.id);
      setStreak(newStreak);
      
      // تحديث العادة في القائمة الرئيسية مع الـ streak المحدث
      if (onHabitUpdated) {
        onHabitUpdated({ ...habit, ...formData, streak: newStreak });
      }
    } catch (error) {
      console.error('Error adding another completion:', error);
      alert('حدث خطأ أثناء إضافة مرة أخرى');
    }
  };

  const handleAddSubtask = () => {
    const newSubtask = {
      id: 'subtask_' + Date.now(),
      title: '',
      points: 5,
    };
    setSubtasks([...subtasks, newSubtask]);
  };

  const handleSubtaskChange = (index, field, value) => {
    const updated = [...subtasks];
    updated[index][field] = field === 'points' ? parseInt(value) || 0 : value;
    setSubtasks(updated);
  };

  const handleDeleteSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const totalSubtasksPoints = subtasks.reduce((sum, st) => sum + (st.points || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">تعديل العادة</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم العادة</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="مثال: صلاة الفجر"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الوصف</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows="3"
              placeholder="وصف مختصر للعادة..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الفئة</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.values(HABIT_CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              النقاط الإجمالية
              {subtasks.length > 0 && (
                <span className="text-xs text-muted-foreground mr-2">
                  (مجموع المهام الفرعية: {totalSubtasksPoints})
                </span>
              )}
            </label>
            <input
              type="number"
              min={formData.category === "bad" ? "-100" : "1"}
              max="100"
              required
              value={formData.points}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setFormData({ ...formData, points: value });
              }}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {formData.category === "bad" && formData.points >= 0 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                💡 تلميح: العادات السيئة يجب أن تكون نقاطها سالبة
              </p>
            )}
            {subtasks.length > 0 && totalSubtasksPoints !== formData.points && (
              <p className="text-xs text-destructive mt-1">
                ⚠️ تحذير: مجموع المهام الفرعية ({totalSubtasksPoints}) لا يساوي النقاط الإجمالية ({formData.points})
              </p>
            )}
          </div>

          {/* معلومات الـ streak */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">معلومات الإنجاز</label>
              <div className="flex items-center gap-4">
                {streak > 0 && (
                  <div className="flex items-center gap-1 rounded-full px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 text-sm font-medium">
                    <Flame className="h-4 w-4" />
                    {streak} {streak === 1 ? 'يوم' : 'يوم متتالي'}
                  </div>
                )}
                {formData.category === "bad" && completionCount > 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
                    <span className="bg-red-100 dark:bg-red-950 px-2 py-1 rounded">
                      {completionCount}x
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* أزرار تفعيل/إلغاء تفعيل للعادات السيئة */}
          {formData.category === "bad" && (
            <div className="border-t border-border pt-4">
              <label className="block text-sm font-medium mb-3">حالة التفعيل</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleToggleCompletion}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isCompleted
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <div className={`flex size-5 items-center justify-center rounded border-2 ${
                    isCompleted
                      ? "border-white bg-white text-red-500"
                      : "border-border bg-background"
                  }`}>
                    {isCompleted && <Check className="h-3 w-3" />}
                  </div>
                  <span>{isCompleted ? "مفعّلة" : "غير مفعّلة"}</span>
                </button>
                
                {isCompleted && (
                  <button
                    type="button"
                    onClick={handleAddAnother}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة مرة أخرى
                  </button>
                )}
              </div>
              {isCompleted && (
                <p className="text-xs text-muted-foreground mt-2">
                  العادة مفعّلة اليوم ({completionCount} {completionCount === 1 ? 'مرة' : 'مرات'})
                </p>
              )}
            </div>
          )}

          {/* Subtasks Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">المهام الفرعية (اختياري)</label>
              <button
                type="button"
                onClick={handleAddSubtask}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-3 w-3" />
                إضافة مهمة
              </button>
            </div>
            
            {subtasks.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-muted/30 rounded-lg">
                {subtasks.map((subtask, index) => (
                  <div key={subtask.id} className="flex items-center gap-2 bg-background p-2 rounded border border-border">
                    <input
                      type="text"
                      placeholder="اسم المهمة..."
                      value={subtask.title}
                      onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-input rounded bg-background"
                    />
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={subtask.points}
                      onChange={(e) => handleSubtaskChange(index, 'points', e.target.value)}
                      className="w-16 px-2 py-1 text-sm border border-input rounded bg-background text-center"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(index)}
                      className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {subtasks.length === 0 && (
              <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded text-center">
                لا توجد مهام فرعية. اضغط "إضافة مهمة" لتقسيم هذه العادة.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'جاري التحديث...' : 'حفظ التعديلات'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHabitModal;

