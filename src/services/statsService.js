import { getCompletions } from './habitService';
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

// الحصول على إحصائيات أسبوعية
export const getWeeklyStats = async (habits) => {
  const now = new Date();
  const startDate = subDays(now, 6); // آخر 7 أيام
  const endDate = now;
  
  const completions = await getCompletions(startDate, endDate);
  
  // إحصائيات يومية
  const dailyStats = {};
  for (let i = 0; i < 7; i++) {
    const date = format(subDays(now, 6 - i), 'yyyy-MM-dd');
    dailyStats[date] = {
      date,
      completedCount: 0,
      totalPoints: 0,
    };
  }
  
  completions.forEach(completion => {
    if (dailyStats[completion.date]) {
      dailyStats[completion.date].completedCount++;
      dailyStats[completion.date].totalPoints += completion.points;
    }
  });
  
  // إحصائيات حسب الفئة
  const categoryStats = {};
  const habitMap = {};
  habits.forEach(habit => {
    habitMap[habit.id] = habit;
    if (!categoryStats[habit.category]) {
      categoryStats[habit.category] = {
        category: habit.category,
        completedCount: 0,
        totalPoints: 0,
      };
    }
  });
  
  completions.forEach(completion => {
    const habit = habitMap[completion.habitId];
    if (habit && categoryStats[habit.category]) {
      categoryStats[habit.category].completedCount++;
      categoryStats[habit.category].totalPoints += completion.points;
    }
  });
  
  return {
    daily: Object.values(dailyStats),
    byCategory: Object.values(categoryStats),
    totalCompletions: completions.length,
    totalPoints: completions.reduce((sum, c) => sum + c.points, 0),
  };
};

// الحصول على إحصائيات شهرية
export const getMonthlyStats = async (habits) => {
  const now = new Date();
  const startDate = subDays(now, 29); // آخر 30 يوم
  const endDate = now;
  
  const completions = await getCompletions(startDate, endDate);
  
  // إحصائيات أسبوعية (4 أسابيع)
  const weeklyStats = [
    { week: 'الأسبوع 1', completedCount: 0, totalPoints: 0 },
    { week: 'الأسبوع 2', completedCount: 0, totalPoints: 0 },
    { week: 'الأسبوع 3', completedCount: 0, totalPoints: 0 },
    { week: 'الأسبوع 4', completedCount: 0, totalPoints: 0 },
  ];
  
  completions.forEach(completion => {
    const completionDate = new Date(completion.date);
    const daysAgo = Math.floor((now - completionDate) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.min(Math.floor(daysAgo / 7), 3);
    
    weeklyStats[3 - weekIndex].completedCount++;
    weeklyStats[3 - weekIndex].totalPoints += completion.points;
  });
  
  // إحصائيات حسب الفئة
  const categoryStats = {};
  const habitMap = {};
  habits.forEach(habit => {
    habitMap[habit.id] = habit;
    if (!categoryStats[habit.category]) {
      categoryStats[habit.category] = {
        category: habit.category,
        completedCount: 0,
        totalPoints: 0,
      };
    }
  });
  
  completions.forEach(completion => {
    const habit = habitMap[completion.habitId];
    if (habit && categoryStats[habit.category]) {
      categoryStats[habit.category].completedCount++;
      categoryStats[habit.category].totalPoints += completion.points;
    }
  });
  
  return {
    weekly: weeklyStats,
    byCategory: Object.values(categoryStats),
    totalCompletions: completions.length,
    totalPoints: completions.reduce((sum, c) => sum + c.points, 0),
  };
};

// الحصول على أفضل العادات (الأكثر إنجازاً)
export const getTopHabits = async (habits, days = 30) => {
  const now = new Date();
  const startDate = subDays(now, days - 1);
  const endDate = now;
  
  const completions = await getCompletions(startDate, endDate);
  
  const habitStats = {};
  habits.forEach(habit => {
    habitStats[habit.id] = {
      habit,
      completedCount: 0,
      totalPoints: 0,
    };
  });
  
  completions.forEach(completion => {
    if (habitStats[completion.habitId]) {
      habitStats[completion.habitId].completedCount++;
      habitStats[completion.habitId].totalPoints += completion.points;
    }
  });
  
  return Object.values(habitStats)
    .sort((a, b) => b.completedCount - a.completedCount)
    .slice(0, 5);
};

