import { useEffect, useState } from 'react';
import { format } from 'date-fns';

// مكون لعرض النقاط اليومية مع إعادة تعيين تلقائي
const TodayPointsBadge = ({ totalPoints }) => {
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [displayPoints, setDisplayPoints] = useState(totalPoints);

  useEffect(() => {
    // التحقق من تغيير اليوم كل دقيقة
    const interval = setInterval(() => {
      const today = format(new Date(), 'yyyy-MM-dd');
      if (today !== currentDate) {
        setCurrentDate(today);
        setDisplayPoints(0);
        // إعادة تحميل الصفحة لتحديث البيانات
        window.location.reload();
      }
    }, 60000); // كل دقيقة

    return () => clearInterval(interval);
  }, [currentDate]);

  useEffect(() => {
    setDisplayPoints(totalPoints);
  }, [totalPoints]);

  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">نقاط اليوم</p>
          <p className="text-4xl font-bold">{displayPoints}</p>
          <p className="text-xs opacity-75 mt-1">
            {format(new Date(), 'EEEE، d MMMM yyyy', { locale: 'ar' })}
          </p>
        </div>
        <div className="bg-white/20 p-4 rounded-full">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-sm opacity-90">
          النقاط تُصفّر تلقائياً مع بداية كل يوم جديد
        </p>
      </div>
    </div>
  );
};

export default TodayPointsBadge;

