import { useState, useEffect } from 'react';
import { ShoppingBag, Gift, Coins, CheckCircle2, AlertCircle } from 'lucide-react';
import { getRewards, purchaseReward } from '../services/rewardsService';
import { getPointsBalance, syncPointsFromCompletions } from '../services/pointsService';

const StorePage = () => {
  const [rewards, setRewards] = useState([]);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // مزامنة النقاط من الإنجازات
      await syncPointsFromCompletions();
      
      const [rewardsData, balance] = await Promise.all([
        getRewards(),
        getPointsBalance(),
      ]);
      
      setRewards(rewardsData);
      setPointsBalance(balance);
    } catch (error) {
      console.error('Error loading store data:', error);
      setMessage({ type: 'error', text: 'حدث خطأ أثناء تحميل البيانات' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (reward) => {
    if (purchasing) return;

    const cost = reward.costRange 
      ? Math.floor((reward.costRange.min + reward.costRange.max) / 2)
      : reward.cost;

    if (pointsBalance < cost) {
      setMessage({ 
        type: 'error', 
        text: `رصيدك الحالي (${pointsBalance}) غير كافٍ لشراء هذه الجائزة (${cost} نقطة)` 
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!confirm(`هل أنت متأكد من شراء "${reward.title}" مقابل ${cost} نقطة؟`)) {
      return;
    }

    setPurchasing(reward.id);
    setMessage(null);

    try {
      const newBalance = await purchaseReward(reward.id, cost);
      setPointsBalance(newBalance);
      setMessage({ 
        type: 'success', 
        text: `تم شراء "${reward.title}" بنجاح! رصيدك الحالي: ${newBalance} نقطة` 
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error purchasing reward:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'حدث خطأ أثناء شراء الجائزة' 
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setPurchasing(null);
    }
  };

  const goodRewards = rewards.filter(r => r.category === 'good');
  const neutralRewards = rewards.filter(r => r.category === 'neutral');

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
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">متجر الجوائز</h1>
              <p className="text-muted-foreground">استخدم نقاطك لشراء مكافآت</p>
            </div>
          </div>

          {/* Points Balance Card */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">رصيد النقاط المتراكمة</p>
                <p className="text-4xl font-bold">{pointsBalance}</p>
                <p className="text-xs opacity-75 mt-1">
                  💡 النقاط تتراكم من إنجاز العادات اليومية
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-full">
                <Coins className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p className="flex-1">{message.text}</p>
          </div>
        )}

        {/* Good Rewards */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">مكافآت جيدة</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goodRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                pointsBalance={pointsBalance}
                onPurchase={handlePurchase}
                isPurchasing={purchasing === reward.id}
              />
            ))}
          </div>
        </div>

        {/* Neutral Rewards */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">مكافآت محايدة</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {neutralRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                pointsBalance={pointsBalance}
                onPurchase={handlePurchase}
                isPurchasing={purchasing === reward.id}
              />
            ))}
          </div>
        </div>

        {rewards.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">لا توجد جوائز متاحة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RewardCard = ({ reward, pointsBalance, onPurchase, isPurchasing }) => {
  const cost = reward.costRange 
    ? Math.floor((reward.costRange.min + reward.costRange.max) / 2)
    : reward.cost;

  const canAfford = pointsBalance >= cost;
  const costDisplay = reward.costRange
    ? `${reward.costRange.min}-${reward.costRange.max}`
    : cost;

  return (
    <div
      className={`bg-card border rounded-lg p-6 shadow-md transition-all ${
        canAfford
          ? 'border-border hover:shadow-lg hover:scale-[1.02]'
          : 'border-muted opacity-75'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{reward.icon}</span>
          <div>
            <h3 className="text-lg font-semibold">{reward.title}</h3>
            <p className="text-sm text-muted-foreground">{reward.description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p className="text-sm text-muted-foreground">التكلفة</p>
          <p className="text-xl font-bold text-primary">{costDisplay} نقطة</p>
        </div>
        <button
          onClick={() => onPurchase(reward)}
          disabled={!canAfford || isPurchasing}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            canAfford
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isPurchasing ? 'جاري الشراء...' : 'شراء'}
        </button>
      </div>
    </div>
  );
};

export default StorePage;

