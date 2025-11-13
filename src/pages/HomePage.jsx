import { useState, useEffect } from 'react';
import { Plus, TrendingUp, GripVertical, Flame } from 'lucide-react';
import HabitCard from '../components/HabitCard';
import AddHabitModal from '../components/AddHabitModal';
import EditHabitModal from '../components/EditHabitModal';
import { getHabits, completeHabit, uncompleteHabit, isHabitCompletedToday, calculateStreak, deleteHabit, updateHabitsOrder, addSubtask, deleteSubtask, getBadHabitCompletionsCountToday, getBadHabitPointsToday } from '../services/habitService';
import { getCategoryById } from '../config/categories';
import { getTopStreaks, getStreakBadge, getStreakStats } from '../services/streakService';
import { getCompletedSubtasksToday, completeSubtask, uncompleteSubtask } from '../services/subtaskService';
import { updatePointsBalance } from '../services/pointsService';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// مكون العادة القابل للسحب
const SortableHabitItem = ({ habit, icon, category, completed, onCheckedChange, onEdit, onDelete, subtasks, completedSubtasks, onSubtaskToggle, onSubtaskAdd, onSubtaskDelete, isBadHabit, completionCount, onAddAnother }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div 
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <HabitCard
        id={habit.id}
        title={habit.title}
        description={habit.description}
        icon={icon}
        streak={habit.streak || 0}
        points={habit.points}
        category={category.name}
        completed={completed}
        onCheckedChange={onCheckedChange}
        onEdit={onEdit}
        onDelete={onDelete}
        showActions={true}
        subtasks={subtasks}
        completedSubtasks={completedSubtasks}
        onSubtaskToggle={onSubtaskToggle}
        onSubtaskAdd={onSubtaskAdd}
        onSubtaskDelete={onSubtaskDelete}
        isBadHabit={isBadHabit}
        completionCount={completionCount}
        onAddAnother={onAddAnother}
      />
    </div>
  );
};

const HomePage = () => {
  const [habits, setHabits] = useState([]);
  const [completedHabits, setCompletedHabits] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [topStreaks, setTopStreaks] = useState([]);
  const [streakStats, setStreakStats] = useState(null);
  const [completedSubtasks, setCompletedSubtasks] = useState({});
  const [badHabitCounts, setBadHabitCounts] = useState({}); // عدد مرات إكمال العادات السيئة

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    setIsLoading(true);
    try {
      const habitsData = await getHabits();
      
      // التحقق من الإنجاز لكل عادة وحساب الـ streak والمهام الفرعية
      const completedStatus = {};
      const completedSubtasksMap = {};
      const badHabitCountsMap = {};
      const habitsWithStreak = await Promise.all(
        habitsData.map(async (habit) => {
          const isBadHabit = habit.category === "bad";
          let isCompleted = false;
          let completionCount = 0;

          if (isBadHabit) {
            // للعادات السيئة، نحصل على عدد المرات
            completionCount = await getBadHabitCompletionsCountToday(habit.id);
            isCompleted = completionCount > 0;
            badHabitCountsMap[habit.id] = completionCount;
          } else {
            // للعادات العادية، نستخدم النظام القديم
            isCompleted = await isHabitCompletedToday(habit.id);
          }

          const streak = await calculateStreak(habit.id);
          completedStatus[habit.id] = isCompleted;
          
          // تحميل المهام الفرعية المكتملة
          if (habit.subtasks && habit.subtasks.length > 0) {
            const completed = await getCompletedSubtasksToday(habit.id, habit.subtasks);
            completedSubtasksMap[habit.id] = completed;
          }
          
          return { ...habit, streak };
        })
      );
      
      // ترتيب العادات حسب الـ order
      const sortedHabits = habitsWithStreak.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      setHabits(sortedHabits);
      setCompletedHabits(completedStatus);
      setCompletedSubtasks(completedSubtasksMap);
      setBadHabitCounts(badHabitCountsMap);
      
      // حساب إجمالي النقاط اليوم (شامل المهام الفرعية والعادات السيئة)
      let todayPoints = 0;
      sortedHabits.forEach(habit => {
        const isBadHabit = habit.category === "bad";
        
        if (isBadHabit) {
          // للعادات السيئة، نحسب النقاط بناءً على عدد المرات
          const count = badHabitCountsMap[habit.id] || 0;
          todayPoints += count * habit.points; // النقاط سالبة، لذا سيتم الخصم
        } else if (completedStatus[habit.id]) {
          // للعادات العادية
          if (habit.subtasks && habit.subtasks.length > 0) {
            // احسب نقاط المهام الفرعية المكتملة
            const subtaskPoints = habit.subtasks
              .filter(st => completedSubtasksMap[habit.id]?.includes(st.id))
              .reduce((sum, st) => sum + (st.points || 0), 0);
            todayPoints += subtaskPoints;
          } else {
            todayPoints += habit.points || 0;
          }
        }
      });
      setTotalPoints(todayPoints);
      
      // حساب أفضل الـ Streaks
      const streaksData = sortedHabits.map(habit => ({
        habit,
        streak: habit.streak || 0,
      })).filter(item => item.streak > 0)
        .sort((a, b) => b.streak - a.streak);
      
      setTopStreaks(streaksData);
      
      const stats = getStreakStats(streaksData);
      setStreakStats(stats);
      
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHabitCheck = async (habitId, checked) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isBadHabit = habit.category === "bad";

    try {
      if (checked) {
        await completeHabit(habitId, habit.points, isBadHabit);
        setTotalPoints(prev => prev + habit.points);
        // تحديث رصيد النقاط المتراكمة
        await updatePointsBalance(habit.points);
        
        // للعادات السيئة، نزيد العدد
        if (isBadHabit) {
          setBadHabitCounts(prev => ({
            ...prev,
            [habitId]: (prev[habitId] || 0) + 1,
          }));
        }
      } else {
        await uncompleteHabit(habitId, isBadHabit);
        setTotalPoints(prev => prev - habit.points);
        // تحديث رصيد النقاط المتراكمة (خصم النقاط)
        await updatePointsBalance(-habit.points);
        
        // للعادات السيئة، نقلل العدد
        if (isBadHabit) {
          setBadHabitCounts(prev => ({
            ...prev,
            [habitId]: Math.max(0, (prev[habitId] || 0) - 1),
          }));
        }
      }
      
      setCompletedHabits(prev => ({
        ...prev,
        [habitId]: checked,
      }));
      
      // تحديث الـ streak
      const newStreak = await calculateStreak(habitId);
      setHabits(prev => prev.map(h => 
        h.id === habitId ? { ...h, streak: newStreak } : h
      ));
      
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  // دالة خاصة للعادات السيئة - إضافة مرة أخرى
  const handleBadHabitAdd = async (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || habit.category !== "bad") return;

    try {
      await completeHabit(habitId, habit.points, true);
      setTotalPoints(prev => prev + habit.points);
      await updatePointsBalance(habit.points);
      
      setBadHabitCounts(prev => ({
        ...prev,
        [habitId]: (prev[habitId] || 0) + 1,
      }));
      
      setCompletedHabits(prev => ({
        ...prev,
        [habitId]: true,
      }));
    } catch (error) {
      console.error('Error adding bad habit completion:', error);
    }
  };

  const handleHabitAdded = (newHabit) => {
    setHabits(prev => [...prev, newHabit]);
  };

  const handleHabitEdit = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      setEditingHabit(habit);
      setIsEditModalOpen(true);
    }
  };

  const handleHabitUpdated = (updatedHabit) => {
    setHabits(prev => prev.map(h => 
      h.id === updatedHabit.id ? updatedHabit : h
    ));
  };

  const handleHabitDelete = async (habitId) => {
    if (!confirm('هل أنت متأكد من حذف هذه العادة؟ سيتم حذف جميع سجلات الإنجاز المرتبطة بها.')) {
      return;
    }

    try {
      await deleteHabit(habitId);
      setHabits(prev => prev.filter(h => h.id !== habitId));
      
      // تحديث النقاط إذا كانت العادة مكتملة اليوم
      if (completedHabits[habitId]) {
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
          setTotalPoints(prev => prev - habit.points);
        }
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('حدث خطأ أثناء حذف العادة');
    }
  };

  const handleSubtaskAdd = async (habitId, subtaskData) => {
    try {
      const newSubtask = await addSubtask(habitId, subtaskData);
      setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          return {
            ...h,
            subtasks: [...(h.subtasks || []), newSubtask],
          };
        }
        return h;
      }));
    } catch (error) {
      console.error('Error adding subtask:', error);
      alert('حدث خطأ أثناء إضافة المهمة الفرعية');
    }
  };

  const handleSubtaskDelete = async (habitId, subtaskId) => {
    try {
      await deleteSubtask(habitId, subtaskId);
      
      // حذف من المكتملات
      setCompletedSubtasks(prev => ({
        ...prev,
        [habitId]: (prev[habitId] || []).filter(id => id !== subtaskId),
      }));
      
      // تحديث العادة
      setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          return {
            ...h,
            subtasks: (h.subtasks || []).filter(st => st.id !== subtaskId),
          };
        }
        return h;
      }));
      
      // إعادة حساب النقاط
      await loadHabits();
    } catch (error) {
      console.error('Error deleting subtask:', error);
      alert('حدث خطأ أثناء حذف المهمة الفرعية');
    }
  };

  const handleSubtaskToggle = async (habitId, subtaskId, checked) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const subtask = habit.subtasks?.find(st => st.id === subtaskId);
    if (!subtask) return;

    try {
      if (checked) {
        await completeSubtask(habitId, subtaskId, subtask.points);
        setCompletedSubtasks(prev => ({
          ...prev,
          [habitId]: [...(prev[habitId] || []), subtaskId],
        }));
        setTotalPoints(prev => prev + subtask.points);
        // تحديث رصيد النقاط المتراكمة
        await updatePointsBalance(subtask.points);
      } else {
        await uncompleteSubtask(habitId, subtaskId);
        setCompletedSubtasks(prev => ({
          ...prev,
          [habitId]: (prev[habitId] || []).filter(id => id !== subtaskId),
        }));
        setTotalPoints(prev => prev - subtask.points);
        // تحديث رصيد النقاط المتراكمة (خصم النقاط)
        await updatePointsBalance(-subtask.points);
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  // إعداد sensors للـ drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event, categoryId) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const categoryHabits = habits.filter(h => h.category === categoryId);
    const oldIndex = categoryHabits.findIndex(h => h.id === active.id);
    const newIndex = categoryHabits.findIndex(h => h.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedCategoryHabits = arrayMove(categoryHabits, oldIndex, newIndex);
    
    // تحديث جميع العادات مع الترتيب الجديد
    const otherHabits = habits.filter(h => h.category !== categoryId);
    const allHabits = [...otherHabits, ...reorderedCategoryHabits];
    
    setHabits(allHabits);

    // حفظ الترتيب الجديد في Firebase
    try {
      await updateHabitsOrder(allHabits);
    } catch (error) {
      console.error('Error saving order:', error);
      // إعادة تحميل العادات في حالة الفشل
      loadHabits();
    }
  };

  const groupedHabits = habits.reduce((acc, habit) => {
    const category = habit.category || 'religious';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(habit);
    return acc;
  }, {});

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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">عاداتي اليومية</h1>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString('ar-SA', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-colors shadow-lg"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>

          {/* Stats Card */}
          <div className={`rounded-xl p-6 shadow-lg ${
            totalPoints >= 0 
              ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground' 
              : 'bg-gradient-to-r from-red-600 to-red-700 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">نقاط اليوم</p>
                <p className="text-4xl font-bold">{totalPoints}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date().toLocaleDateString('ar-SA', { 
                    weekday: 'long'
                  })}
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-full">
                {totalPoints >= 0 ? (
                  <TrendingUp className="h-8 w-8" />
                ) : (
                  <TrendingUp className="h-8 w-8 rotate-180" />
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm opacity-90">
                أكملت {Object.values(completedHabits).filter(Boolean).length} من {habits.length} عادة
              </p>
              <p className="text-xs opacity-75 mt-1">
                💡 النقاط تُحسب لليوم الحالي فقط {totalPoints < 0 && '⚠️ العادات السيئة تخصم نقاط'}
              </p>
            </div>
          </div>
        </div>

        {/* Streaks Section */}
        {topStreaks.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="h-6 w-6" />
                <h2 className="text-2xl font-bold">🔥 السلاسل المتتالية</h2>
              </div>
              
              {/* Streak Stats */}
              {streakStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                    <p className="text-3xl font-bold">{streakStats.longestStreak}</p>
                    <p className="text-xs opacity-90">أطول سلسلة</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                    <p className="text-3xl font-bold">{streakStats.activeStreaks}</p>
                    <p className="text-xs opacity-90">سلاسل نشطة</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                    <p className="text-3xl font-bold">{streakStats.averageStreak}</p>
                    <p className="text-xs opacity-90">متوسط</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center backdrop-blur-sm">
                    <p className="text-3xl font-bold">{streakStats.totalStreaks}</p>
                    <p className="text-xs opacity-90">عادات متتبعة</p>
                  </div>
                </div>
              )}

              {/* Top 3 Streaks */}
              <div className="space-y-2">
                {topStreaks.slice(0, 3).map((item, index) => {
                  const badge = getStreakBadge(item.streak);
                  return (
                    <div key={item.habit.id} className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{badge.icon}</span>
                        <div>
                          <p className="font-semibold text-sm">{item.habit.title}</p>
                          <p className="text-xs opacity-90">{badge.title} - {badge.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5" />
                        <span className="text-2xl font-bold">{item.streak}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {topStreaks.length > 3 && (
                <p className="text-xs text-center mt-3 opacity-75">
                  و {topStreaks.length - 3} عادات أخرى بسلاسل نشطة
                </p>
              )}
            </div>
          </div>
        )}

        {/* Habits by Category */}
        {Object.entries(groupedHabits).map(([categoryId, categoryHabits]) => {
          const category = getCategoryById(categoryId);
          const CategoryIcon = category.icon;
          
          return (
            <div key={categoryId} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg ${category.bgColor}`}>
                  <CategoryIcon className={`h-5 w-5 ${category.color}`} />
                </div>
                <h2 className="text-xl font-semibold">{category.name}</h2>
                <span className="text-sm text-muted-foreground">({categoryHabits.length})</span>
              </div>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, categoryId)}
              >
                <SortableContext
                  items={categoryHabits.map(h => h.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {categoryHabits.map((habit) => (
                      <SortableHabitItem
                        key={habit.id}
                        habit={habit}
                        icon={<CategoryIcon className="size-5" />}
                        category={category}
                        completed={completedHabits[habit.id] || false}
                        onCheckedChange={(checked) => handleHabitCheck(habit.id, checked)}
                        onEdit={handleHabitEdit}
                        onDelete={handleHabitDelete}
                        subtasks={habit.subtasks || []}
                        completedSubtasks={completedSubtasks[habit.id] || []}
                        onSubtaskToggle={(subtaskId, checked) => handleSubtaskToggle(habit.id, subtaskId, checked)}
                        onSubtaskAdd={handleSubtaskAdd}
                        onSubtaskDelete={(subtaskId) => handleSubtaskDelete(habit.id, subtaskId)}
                        isBadHabit={habit.category === "bad"}
                        completionCount={badHabitCounts[habit.id] || 0}
                        onAddAnother={() => handleBadHabitAdd(habit.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          );
        })}

        {habits.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">لا توجد عادات بعد</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              إضافة أول عادة
            </button>
          </div>
        )}
      </div>

      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onHabitAdded={handleHabitAdded}
      />

      <EditHabitModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHabit(null);
        }}
        habit={editingHabit}
        onHabitUpdated={handleHabitUpdated}
      />
    </div>
  );
};

export default HomePage;

