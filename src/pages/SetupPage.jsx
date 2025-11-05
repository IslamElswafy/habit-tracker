import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { addAllHabits } from '../utils/addHabitsHelper';

const SetupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleAddHabits = async () => {
    setIsLoading(true);
    try {
      const addResult = await addAllHabits();
      setResult(addResult);
    } catch (error) {
      console.error('Error adding habits:', error);
      setResult({ success: 0, failed: 0, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-2 text-center">مرحباً بك في متتبع العادات! 🎉</h1>
          <p className="text-muted-foreground text-center mb-8">
            لبدء رحلتك، يمكنك إضافة 40 عادة جاهزة مصنفة حسب أنواعها
          </p>

          {!result && (
            <div className="space-y-6">
              <div className="bg-muted rounded-lg p-6">
                <h2 className="font-semibold mb-4">العادات التي سيتم إضافتها:</h2>
                <ul className="space-y-2 text-sm">
                  <li>🕌 <strong>9 عادات دينية</strong> (صلاة، قرآن، أذكار)</li>
                  <li>❤️ <strong>11 عادة صحية</strong> (تنظيف، نوم، تغذية، روتين)</li>
                  <li>💪 <strong>2 عادة رياضية</strong> (جيم، مشي)</li>
                  <li>📚 <strong>7 عادات تعليمية</strong> (وظيفة، تخطيط، ميزانية)</li>
                  <li>👥 <strong>4 عادات اجتماعية</strong> (عائلة، تطوع، ادخار)</li>
                  <li>☕ <strong>3 عادات ترفيهية</strong> (هوايات، طبيعة)</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>الإجمالي:</strong> 40 عادة بنقاط تتراوح من 5 إلى 50 نقطة
                  </p>
                </div>
              </div>

              <button
                onClick={handleAddHabits}
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-semibold text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    إضافة جميع العادات
                  </>
                )}
              </button>

              <button
                onClick={handleGoHome}
                className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg hover:bg-secondary/80 transition-colors"
              >
                تخطي وإضافة يدوياً
              </button>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {result.success > 0 ? (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                        تمت الإضافة بنجاح! 🎉
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        تم إضافة {result.success} عادة من أصل {result.total}
                      </p>
                    </div>
                  </div>
                  
                  {result.failed > 0 && (
                    <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        ⚠️ فشل إضافة {result.failed} عادة
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-600 dark:text-green-400">
                      معرف الجهاز: <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">{result.deviceId}</code>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                        حدث خطأ
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {result.error || 'فشل إضافة العادات'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleGoHome}
                className="w-full bg-primary text-primary-foreground py-4 rounded-lg hover:bg-primary/90 transition-colors font-semibold text-lg"
              >
                الذهاب للصفحة الرئيسية
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>يمكنك دائماً إضافة، تعديل، أو حذف العادات من الصفحة الرئيسية</p>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;

