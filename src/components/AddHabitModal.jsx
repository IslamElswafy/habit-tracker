import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { HABIT_CATEGORIES } from '../config/categories';
import { addHabit } from '../services/habitService';

const AddHabitModal = ({ isOpen, onClose, onHabitAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'religious',
    points: 10,
  });
  const [subtasks, setSubtasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pointsInput, setPointsInput] = useState('10');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const habitData = {
        ...formData,
        subtasks,
      };
      const newHabit = await addHabit(habitData);
      onHabitAdded(newHabit);
      setFormData({
        title: '',
        description: '',
        category: 'religious',
        points: 10,
      });
      setPointsInput('10');
      setSubtasks([]);
      onClose();
    } catch (error) {
      console.error('Error adding habit:', error);
      alert('حدث خطأ أثناء إضافة العادة');
    } finally {
      setIsLoading(false);
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
          <h2 className="text-xl font-bold">إضافة عادة جديدة</h2>
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
              onChange={(e) => {
                const newCategory = e.target.value;
                setFormData({ ...formData, category: newCategory });
                // تحديث القيمة الافتراضية عند تغيير الفئة
                if (newCategory === "bad" && formData.points > 0) {
                  setFormData(prev => ({ ...prev, points: -10 }));
                  setPointsInput('-10');
                } else if (newCategory !== "bad" && formData.points < 0) {
                  setFormData(prev => ({ ...prev, points: 10 }));
                  setPointsInput('10');
                }
              }}
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
              type="text"
              inputMode="numeric"
              required
              value={pointsInput}
              onChange={(e) => {
                const inputValue = e.target.value;
                setPointsInput(inputValue);
                // السماح بإدخال الأرقام السالبة للعادات السيئة
                if (inputValue === '' || inputValue === '-') {
                  // السماح بكتابة "-" للبدء بإدخال رقم سالب
                  return;
                } else if (/^-?\d+$/.test(inputValue)) {
                  // التحقق من أن القيمة رقم صحيح (سالب أو موجب)
                  const numValue = Number(inputValue);
                  const minValue = formData.category === "bad" ? -100 : 1;
                  const maxValue = 100;
                  if (numValue >= minValue && numValue <= maxValue) {
                    setFormData({ ...formData, points: numValue });
                  }
                }
              }}
              onBlur={(e) => {
                // عند فقدان التركيز، التأكد من أن القيمة صحيحة
                if (e.target.value === '' || e.target.value === '-') {
                  const defaultValue = formData.category === "bad" ? -10 : 10;
                  setFormData({ ...formData, points: defaultValue });
                  setPointsInput(String(defaultValue));
                } else {
                  setPointsInput(String(formData.points));
                }
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
              <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-muted/30 rounded-lg">
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
              {isLoading ? 'جاري الإضافة...' : 'إضافة'}
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

export default AddHabitModal;

