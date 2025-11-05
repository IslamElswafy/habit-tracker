import { calculateStreak } from "./habitService";

// حساب أفضل Streaks للعادات
export const getTopStreaks = async (habits) => {
  try {
    const streaksPromises = habits.map(async (habit) => {
      const streak = await calculateStreak(habit.id);
      return {
        habit,
        streak,
      };
    });

    const streaksData = await Promise.all(streaksPromises);

    // ترتيب حسب الـ Streak (من الأعلى للأقل)
    const sortedStreaks = streaksData
      .filter((item) => item.streak > 0)
      .sort((a, b) => b.streak - a.streak);

    return sortedStreaks;
  } catch (error) {
    console.error("Error getting top streaks:", error);
    return [];
  }
};

// الحصول على أيقونة ورسالة تحفيزية حسب طول الـ Streak
export const getStreakBadge = (streak) => {
  if (streak >= 365) {
    return {
      icon: "👑",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      title: "أسطورة",
      description: "سنة كاملة! إنجاز تاريخي!",
    };
  } else if (streak >= 100) {
    return {
      icon: "💎",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      title: "ماسي",
      description: "100 يوم متتالي! رائع جداً!",
    };
  } else if (streak >= 30) {
    return {
      icon: "🏆",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      title: "بطل",
      description: "شهر كامل! استمر!",
    };
  } else if (streak >= 21) {
    return {
      icon: "⭐",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      title: "متألق",
      description: "3 أسابيع! ممتاز!",
    };
  } else if (streak >= 14) {
    return {
      icon: "🌟",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      title: "نجم",
      description: "أسبوعان! واصل!",
    };
  } else if (streak >= 7) {
    return {
      icon: "🔥",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      title: "متحمس",
      description: "أسبوع كامل! رائع!",
    };
  } else if (streak >= 3) {
    return {
      icon: "💪",
      color: "text-green-600",
      bgColor: "bg-green-100",
      title: "قوي",
      description: "بداية ممتازة!",
    };
  } else if (streak > 0) {
    return {
      icon: "🎯",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      title: "مبتدئ",
      description: "استمر!",
    };
  }

  return {
    icon: "⚪",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    title: "-",
    description: "ابدأ الآن!",
  };
};

// حساب إحصائيات الـ Streaks
export const getStreakStats = (streaksData) => {
  if (streaksData.length === 0) {
    return {
      totalStreaks: 0,
      averageStreak: 0,
      longestStreak: 0,
      activeStreaks: 0,
    };
  }

  const totalStreaks = streaksData.length;
  const totalDays = streaksData.reduce((sum, item) => sum + item.streak, 0);
  const averageStreak = Math.round(totalDays / totalStreaks);
  const longestStreak = Math.max(...streaksData.map((item) => item.streak));
  const activeStreaks = streaksData.filter((item) => item.streak > 0).length;

  return {
    totalStreaks,
    averageStreak,
    longestStreak,
    activeStreaks,
  };
};
