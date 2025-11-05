import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Award, RefreshCw, Flame } from 'lucide-react';
import { getHabits } from '../services/habitService';
import { getWeeklyStats, getMonthlyStats, getTopHabits } from '../services/statsService';
import { getTopStreaks, getStreakBadge, getStreakStats } from '../services/streakService';
import { getCategoryById } from '../config/categories';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#ef4444', '#eab308', '#ec4899'];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [habits, setHabits] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [topHabits, setTopHabits] = useState([]);
  const [topStreaks, setTopStreaks] = useState([]);
  const [streakStats, setStreakStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const habitsData = await getHabits();
      setHabits(habitsData);
      
      const weekly = await getWeeklyStats(habitsData);
      setWeeklyStats(weekly);
      
      const monthly = await getMonthlyStats(habitsData);
      setMonthlyStats(monthly);
      
      const top = await getTopHabits(habitsData, 30);
      setTopHabits(top);
      
      const streaks = await getTopStreaks(habitsData);
      setTopStreaks(streaks);
      
      const streakStatsData = getStreakStats(streaks);
      setStreakStats(streakStatsData);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">التقارير والإحصائيات</h1>
              <p className="text-muted-foreground">تتبع تقدمك وإنجازاتك</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'weekly'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            تقرير أسبوعي
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'monthly'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            تقرير شهري
          </button>
        </div>

        {/* No Data Message */}
        {habits.length === 0 && (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">لا توجد عادات بعد</h3>
            <p className="text-muted-foreground mb-4">أضف عادات من الصفحة الرئيسية لبدء تتبع تقدمك</p>
            <a href="/" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
              الذهاب للصفحة الرئيسية
            </a>
          </div>
        )}

        {habits.length > 0 && weeklyStats && weeklyStats.totalCompletions === 0 && activeTab === 'weekly' && (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">لم تكمل أي عادة هذا الأسبوع</h3>
            <p className="text-muted-foreground mb-4">ابدأ بإكمال عاداتك اليومية لرؤية التقارير والإحصائيات</p>
            <div className="flex gap-3 justify-center">
              <a href="/" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                الذهاب للصفحة الرئيسية
              </a>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                تحديث البيانات
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              💡 إذا أكملت عادات للتو، اضغط "تحديث البيانات" لرؤية التقارير
            </p>
          </div>
        )}

        {/* Weekly Report */}
        {activeTab === 'weekly' && weeklyStats && weeklyStats.totalCompletions > 0 && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-muted-foreground">إجمالي الإنجازات</h3>
                </div>
                <p className="text-3xl font-bold">{weeklyStats.totalCompletions}</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-medium text-muted-foreground">إجمالي النقاط</h3>
                </div>
                <p className="text-3xl font-bold">{weeklyStats.totalPoints}</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-muted-foreground">متوسط يومي</h3>
                </div>
                <p className="text-3xl font-bold">
                  {(weeklyStats.totalCompletions / 7).toFixed(1)}
                </p>
              </div>
            </div>

            {/* Daily Chart */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">الإنجاز اليومي</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyStats.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('ar-SA', { weekday: 'short' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString('ar-SA')}
                  />
                  <Legend />
                  <Bar dataKey="completedCount" name="عدد الإنجازات" fill="#8b5cf6" />
                  <Bar dataKey="totalPoints" name="النقاط" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">التوزيع حسب الفئات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={weeklyStats.byCategory}
                      dataKey="totalPoints"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => getCategoryById(entry.category).name}
                    >
                      {weeklyStats.byCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {weeklyStats.byCategory.map((cat, index) => {
                    const category = getCategoryById(cat.category);
                    return (
                      <div key={cat.category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-left">
                          <p className="font-bold">{cat.totalPoints} نقطة</p>
                          <p className="text-sm text-muted-foreground">{cat.completedCount} إنجاز</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {habits.length > 0 && monthlyStats && monthlyStats.totalCompletions === 0 && activeTab === 'monthly' && (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">لم تكمل أي عادة هذا الشهر</h3>
            <p className="text-muted-foreground mb-4">ابدأ بإكمال عاداتك اليومية لرؤية التقارير والإحصائيات</p>
            <div className="flex gap-3 justify-center">
              <a href="/" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
                الذهاب للصفحة الرئيسية
              </a>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                تحديث البيانات
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              💡 إذا أكملت عادات للتو، اضغط "تحديث البيانات" لرؤية التقارير
            </p>
          </div>
        )}

        {/* Monthly Report */}
        {activeTab === 'monthly' && monthlyStats && monthlyStats.totalCompletions > 0 && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-muted-foreground">إجمالي الإنجازات</h3>
                </div>
                <p className="text-3xl font-bold">{monthlyStats.totalCompletions}</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-medium text-muted-foreground">إجمالي النقاط</h3>
                </div>
                <p className="text-3xl font-bold">{monthlyStats.totalPoints}</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-muted-foreground">متوسط يومي</h3>
                </div>
                <p className="text-3xl font-bold">
                  {(monthlyStats.totalCompletions / 30).toFixed(1)}
                </p>
              </div>
            </div>

            {/* Weekly Comparison */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">مقارنة الأسابيع</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyStats.weekly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completedCount" name="عدد الإنجازات" fill="#8b5cf6" />
                  <Bar dataKey="totalPoints" name="النقاط" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Streaks Section for Monthly */}
            {topStreaks.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">أفضل السلاسل المتتالية</h3>
                </div>
                
                {/* Streak Stats Summary */}
                {streakStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-primary">{streakStats.longestStreak}</p>
                      <p className="text-xs text-muted-foreground">أطول سلسلة</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{streakStats.activeStreaks}</p>
                      <p className="text-xs text-muted-foreground">سلاسل نشطة</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{streakStats.averageStreak}</p>
                      <p className="text-xs text-muted-foreground">متوسط السلاسل</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">{streakStats.totalStreaks}</p>
                      <p className="text-xs text-muted-foreground">إجمالي العادات</p>
                    </div>
                  </div>
                )}

                {/* Top Streaks List */}
                <div className="space-y-3">
                  {topStreaks.slice(0, 5).map((item) => {
                    const category = getCategoryById(item.habit.category);
                    const CategoryIcon = category.icon;
                    const badge = getStreakBadge(item.streak);
                    
                    return (
                      <div key={item.habit.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                        <div className={`p-3 rounded-lg ${badge.bgColor}`}>
                          <span className="text-2xl">{badge.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{item.habit.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${badge.bgColor} ${badge.color} font-medium`}>
                              {badge.title}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-600" />
                            <p className="text-2xl font-bold">{item.streak}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">يوم متتالي</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category Distribution */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">التوزيع حسب الفئات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={monthlyStats.byCategory}
                      dataKey="totalPoints"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => getCategoryById(entry.category).name}
                    >
                      {monthlyStats.byCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {monthlyStats.byCategory.map((cat, index) => {
                    const category = getCategoryById(cat.category);
                    return (
                      <div key={cat.category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-left">
                          <p className="font-bold">{cat.totalPoints} نقطة</p>
                          <p className="text-sm text-muted-foreground">{cat.completedCount} إنجاز</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Habits */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">أفضل العادات</h3>
              <div className="space-y-3">
                {topHabits.map((item, index) => {
                  const category = getCategoryById(item.habit.category);
                  const CategoryIcon = category.icon;
                  return (
                    <div key={item.habit.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </div>
                      <div className={`p-2 rounded-lg ${category.bgColor}`}>
                        <CategoryIcon className={`h-5 w-5 ${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.habit.title}</h4>
                        <p className="text-sm text-muted-foreground">{category.name}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">{item.totalPoints} نقطة</p>
                        <p className="text-sm text-muted-foreground">{item.completedCount} إنجاز</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;

