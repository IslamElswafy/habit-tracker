// مساعد لإضافة العادات من المتصفح مباشرة
import { collection, addDoc } from "firebase/firestore";
import { db, getDeviceId } from "../config/firebase";

const habitsData = [
  // عادات دينية
  {
    title: "صلاة الفجر + الأذكار",
    description: "أداء صلاة الفجر في وقتها مع أذكار الصباح",
    category: "religious",
    points: 25,
  },
  {
    title: "قراءة قرآن (ورد صباحي)",
    description: "قراءة الورد اليومي من القرآن الكريم",
    category: "religious",
    points: 15,
  },
  {
    title: "صلاة الظهر",
    description: "أداء صلاة الظهر في وقتها",
    category: "religious",
    points: 10,
  },
  {
    title: "صلاة العصر",
    description: "أداء صلاة العصر في وقتها",
    category: "religious",
    points: 10,
  },
  {
    title: "صلاة المغرب + الأذكار",
    description: "أداء صلاة المغرب مع أذكار المساء",
    category: "religious",
    points: 15,
  },
  {
    title: "صلاة العشاء + التراويح",
    description: "أداء صلاة العشاء والتراويح في رمضان",
    category: "religious",
    points: 20,
  },
  {
    title: "استماع لدرس ديني",
    description: "الاستماع لدرس أو محاضرة دينية",
    category: "religious",
    points: 10,
  },
  {
    title: "أذكار النوم",
    description: "قراءة أذكار النوم قبل النوم",
    category: "religious",
    points: 5,
  },
  {
    title: "قراءة قرآن مسائية",
    description: "قراءة قرآن قبل النوم",
    category: "religious",
    points: 10,
  },

  // عادات صحية
  {
    title: "تنظيف الأسنان صباحاً",
    description: "تنظيف الأسنان بعد الفجر",
    category: "health",
    points: 5,
  },
  {
    title: "تنظيف الأسنان مساءً",
    description: "تنظيف الأسنان بعد الجيم/قبل النوم",
    category: "health",
    points: 5,
  },
  {
    title: "شرب 2.5 لتر ماء",
    description: "شرب الكمية الكافية من الماء يومياً",
    category: "health",
    points: 5,
  },
  {
    title: "نوم 7 ساعات",
    description: "الحصول على نوم كافٍ (7 ساعات)",
    category: "health",
    points: 10,
  },
  {
    title: "يوم تغذية ملتزم",
    description: "الالتزام بالسعرات والأكل الصحي",
    category: "health",
    points: 20,
  },
  {
    title: "حساب سعرات اليوم",
    description: "تسجيل وحساب السعرات الحرارية",
    category: "health",
    points: 5,
  },
  {
    title: "يوم طبخ منزلي",
    description: "طبخ وجبة صحية في المنزل",
    category: "health",
    points: 25,
  },
  {
    title: "تنظيف الغرفة",
    description: "ترتيب وتنظيف الغرفة",
    category: "health",
    points: 10,
  },
  {
    title: "تحضير الإفطار",
    description: "تحضير وجبة الإفطار في رمضان",
    category: "health",
    points: 10,
  },
  {
    title: "روتين صباحي",
    description: "ماء + فجر + تحديد 3 أولويات",
    category: "health",
    points: 25,
  },
  {
    title: "روتين مسائي",
    description: "مراجعة اليوم + نوم منظم",
    category: "health",
    points: 10,
  },

  // عادات رياضية
  {
    title: "يوم جيم كامل",
    description: "تمرين كامل + كارديو في الجيم",
    category: "sport",
    points: 25,
  },
  {
    title: "مشي 30 دقيقة",
    description: "مشي إضافي خارج وقت الجيم",
    category: "sport",
    points: 10,
  },

  // عادات تعليمية
  {
    title: "بحث عن وظيفة (ساعة)",
    description: "البحث عن فرص وظيفية ساعة على الأقل",
    category: "educational",
    points: 20,
  },
  {
    title: "متابعة بحث وظيفة",
    description: "متابعة التقديمات والبحث المستمر",
    category: "educational",
    points: 15,
  },
  {
    title: "تسجيل يومي",
    description: "كتابة يوميات أو ملاحظات اليوم",
    category: "educational",
    points: 5,
  },
  {
    title: "تجهيز خطة ليوم جديد",
    description: "التخطيط لليوم القادم",
    category: "educational",
    points: 10,
  },
  {
    title: "وضع ميزانية شهرية",
    description: "التخطيط المالي للشهر",
    category: "educational",
    points: 30,
  },
  {
    title: "البحث عن دخل إضافي",
    description: "البحث عن فرص دخل جانبي",
    category: "educational",
    points: 15,
  },
  {
    title: "نشر المعرفة للآخرين",
    description: "مشاركة الخبرات مع الآخرين",
    category: "educational",
    points: 20,
  },

  // عادات اجتماعية
  {
    title: "جلسة مع الأهل",
    description: "قضاء وقت مع العائلة",
    category: "social",
    points: 15,
  },
  {
    title: "مساعدة المحتاجين",
    description: "تقديم المساعدة للمحتاجين",
    category: "social",
    points: 25,
  },
  {
    title: "التطوع الشهري",
    description: "التطوع في جمعية أو مبادرة",
    category: "social",
    points: 50,
  },
  {
    title: "الادخار الشهري",
    description: "ادخار نسبة من الدخل (10-20%)",
    category: "social",
    points: 30,
  },

  // عادات ترفيهية
  {
    title: "ممارسة هواية",
    description: "رسم، موسيقى، تصوير، إلخ",
    category: "entertainment",
    points: 20,
  },
  {
    title: "الخروج للطبيعة",
    description: "زيارة مكان طبيعي أو سفر",
    category: "entertainment",
    points: 30,
  },
  {
    title: "تجربة نشاط جديد",
    description: "تجربة شيء جديد كل 3 أشهر",
    category: "entertainment",
    points: 50,
  },
];

export async function addAllHabits() {
  console.log("🚀 بدء إضافة العادات...");

  const deviceId = getDeviceId();
  console.log("📱 معرف الجهاز:", deviceId);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < habitsData.length; i++) {
    const habit = habitsData[i];
    try {
      const habitData = {
        ...habit,
        deviceId,
        createdAt: new Date().toISOString(),
        streak: 0,
        order: i, // إضافة ترتيب تلقائي
      };

      await addDoc(collection(db, "habits"), habitData);
      console.log(`✅ تمت إضافة: ${habit.title}`);
      successCount++;
    } catch (error) {
      console.error(`❌ خطأ في إضافة: ${habit.title}`, error);
      errors.push({ habit: habit.title, error: error.message });
      errorCount++;
    }
  }

  const result = {
    success: successCount,
    failed: errorCount,
    total: habitsData.length,
    errors,
    deviceId,
  };

  console.log("\n📊 ملخص:");
  console.log(`✅ نجح: ${successCount} عادة`);
  console.log(`❌ فشل: ${errorCount} عادة`);
  console.log(`💾 معرف الجهاز: ${deviceId}`);

  return result;
}

export { habitsData };
