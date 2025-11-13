import { useState, useEffect } from 'react';
import { Trash2, Edit2, Save, X, AlertTriangle, Download } from 'lucide-react';
import { getHabits, deleteHabit, updateHabit } from '../services/habitService';
import { getCategoryById, HABIT_CATEGORIES } from '../config/categories';
import { addBadHabits } from '../utils/addHabitsHelper';

const SettingsPage = () => {
  const [habits, setHabits] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingBadHabits, setIsAddingBadHabits] = useState(false);
  const [badHabitsResult, setBadHabitsResult] = useState(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    setIsLoading(true);
    try {
      const habitsData = await getHabits();
      setHabits(habitsData);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (habitId) => {
    if (!confirm('هل أنت متأكد من حذف هذه العادة؟')) return;
    
    try {
      await deleteHabit(habitId);
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('حدث خطأ أثناء حذف العادة');
    }
  };

  const handleEdit = (habit) => {
    setEditingId(habit.id);
    setEditForm({
      title: habit.title,
      description: habit.description,
      category: habit.category,
      points: habit.points,
    });
  };

  const handleSave = async (habitId) => {
    try {
      await updateHabit(habitId, editForm);
      setHabits(habits.map(h => 
        h.id === habitId ? { ...h, ...editForm } : h
      ));
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating habit:', error);
      alert('حدث خطأ أثناء تحديث العادة');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleAddBadHabits = async () => {
    if (!confirm('هل تريد إضافة العادات السيئة (6 عادات)؟')) return;
    
    setIsAddingBadHabits(true);
    setBadHabitsResult(null);
    
    try {
      const result = await addBadHabits();
      setBadHabitsResult(result);
      // إعادة تحميل العادات
      await loadHabits();
    } catch (error) {
      console.error('Error adding bad habits:', error);
      setBadHabitsResult({ 
        success: 0, 
        failed: 0, 
        error: error.message 
      });
    } finally {
      setIsAddingBadHabits(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">الإعدادات</h1>
          <p className="text-muted-foreground">إدارة العادات ومعلومات الجهاز</p>
        </div>

        {/* App Info */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">معلومات التطبيق</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الإصدار:</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">وضع المزامنة:</span>
              <span className="text-sm font-medium text-green-600">تلقائي عبر الأجهزة ✅</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
              💡 بياناتك متاحة تلقائياً من أي جهاز أو متصفح
            </p>
          </div>
        </div>

        {/* Add Bad Habits Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">العادات السيئة (ضريبة نقاط)</h2>
              <p className="text-sm text-muted-foreground">
                إضافة 6 عادات سيئة مع نقاط سالبة
              </p>
            </div>
          </div>

          {badHabitsResult ? (
            <div className={`p-4 rounded-lg ${
              badHabitsResult.success > 0 
                ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-sm ${
                badHabitsResult.success > 0 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {badHabitsResult.success > 0 
                  ? `✅ تم إضافة ${badHabitsResult.success} عادة سيئة بنجاح`
                  : `❌ فشل: ${badHabitsResult.error || 'حدث خطأ أثناء الإضافة'}`
                }
              </p>
              {badHabitsResult.failed > 0 && (
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                  ⚠️ فشل إضافة {badHabitsResult.failed} عادة
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={handleAddBadHabits}
              disabled={isAddingBadHabits}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingBadHabits ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  إضافة العادات السيئة
                </>
              )}
            </button>
          )}

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              العادات السيئة تشمل: سوشيال ميديا بلا هدف (-10)، ألعاب فيديو (-20)، 
              مشاهدة مانجا/أنمي (-15)، ترفية (-40)، سهر غير مبرر (-20)، أكل سيئ (-10)
            </p>
          </div>
        </div>

        {/* Habits Management */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">إدارة العادات</h2>
          
          {habits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا توجد عادات لإدارتها</p>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => {
                const category = getCategoryById(habit.category);
                const CategoryIcon = category.icon;
                const isEditing = editingId === habit.id;

                return (
                  <div key={habit.id} className="border border-border rounded-lg p-4">
                    {isEditing ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          placeholder="اسم العادة"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
                          rows="2"
                          placeholder="الوصف"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="px-3 py-2 border border-input rounded-md bg-background"
                          >
                            {Object.values(HABIT_CATEGORIES).map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={editForm.points}
                            onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) })}
                            className="px-3 py-2 border border-input rounded-md bg-background"
                            placeholder="النقاط"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(habit.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                          >
                            <Save className="h-4 w-4" />
                            حفظ
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
                          >
                            <X className="h-4 w-4" />
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${category.bgColor}`}>
                          <CategoryIcon className={`h-5 w-5 ${category.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{habit.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{habit.description}</p>
                          <div className="flex gap-3 text-xs">
                            <span className="bg-secondary px-2 py-1 rounded">{category.name}</span>
                            <span className="bg-secondary px-2 py-1 rounded">{habit.points} نقطة</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(habit)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(habit.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Firebase Configuration Notice */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            تنبيه: إعداد Firebase
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            لكي يعمل التطبيق بشكل صحيح، يجب تحديث ملف التكوين في 
            <code className="mx-1 px-2 py-1 bg-yellow-500/20 rounded">src/config/firebase.js</code>
            بمعلومات مشروعك من Firebase Console.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

