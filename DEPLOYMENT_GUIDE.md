# 🚀 دليل النشر (Deployment)

## خيارات النشر المتاحة

لديك عدة خيارات لنشر تطبيق متتبع العادات:

---

## 1️⃣ GitHub Pages (مجاني) ⭐ موصى به

### المتطلبات:

- حساب GitHub
- Git مثبت على جهازك

### الخطوات:

#### أ) رفع المشروع على GitHub

```bash
# 1. إنشاء repository على GitHub
# اذهب لـ github.com/new وأنشئ repo جديد

# 2. تهيئة Git (إذا لم يكن مهيأً)
git init
git add .
git commit -m "Initial commit"

# 3. ربط مع GitHub (غيّر USERNAME و REPO-NAME)
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git branch -M main
git push -u origin main
```

#### ب) تكوين vite للنشر

افتح `vite.config.js` وأضف:

```javascript
export default defineConfig({
  plugins: [react()],
  base: "/REPO-NAME/", // ضع اسم الـ repo هنا
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

#### ج) النشر

```bash
npm run deploy
```

سيتم:

1. بناء المشروع (`npm run build`)
2. نشره على GitHub Pages تلقائياً
3. الرابط سيكون: `https://USERNAME.github.io/REPO-NAME/`

---

## 2️⃣ Vercel (مجاني) ⚡ الأسرع

### المميزات:

- ✅ نشر تلقائي عند كل commit
- ✅ SSL مجاني
- ✅ CDN عالمي
- ✅ لا حاجة لتعديل vite.config

### الخطوات:

#### عبر الموقع:

1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول بحساب GitHub
3. اضغط "New Project"
4. اختر repository المشروع
5. اضغط "Deploy"

**ملاحظة:** Vercel يكتشف Vite تلقائياً ويبني المشروع!

#### عبر CLI:

```bash
# 1. تثبيت Vercel CLI
npm i -g vercel

# 2. تسجيل الدخول
vercel login

# 3. النشر
vercel

# للإنتاج
vercel --prod
```

---

## 3️⃣ Netlify (مجاني)

### المميزات:

- ✅ واجهة سهلة
- ✅ Drag & Drop deployment
- ✅ نشر تلقائي من Git
- ✅ SSL مجاني

### الخطوات:

#### Drag & Drop:

1. قم ببناء المشروع:

```bash
npm run build
```

2. اذهب إلى [netlify.com](https://netlify.com)
3. سجل دخول
4. اسحب مجلد `dist` إلى الموقع
5. انتهى! 🎉

#### عبر Git:

1. ارفع مشروعك على GitHub
2. في Netlify: "New site from Git"
3. اختر repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. اضغط "Deploy"

---

## 4️⃣ Firebase Hosting

### المميزات:

- ✅ تكامل مع Firebase (أنت تستخدمه بالفعل!)
- ✅ SSL مجاني
- ✅ CDN سريع

### الخطوات:

```bash
# 1. تثبيت Firebase CLI
npm install -g firebase-tools

# 2. تسجيل الدخول
firebase login

# 3. تهيئة Hosting
firebase init hosting

# اختر:
# - استخدم مشروع موجود: habit-tracker-558ae
# - Public directory: dist
# - Single-page app: Yes
# - Overwite index.html: No

# 4. بناء المشروع
npm run build

# 5. النشر
firebase deploy --only hosting
```

---

## 5️⃣ Render (مجاني)

### الخطوات:

1. اذهب إلى [render.com](https://render.com)
2. "New Static Site"
3. اربط repository من GitHub
4. Build command: `npm run build`
5. Publish directory: `dist`
6. اضغط "Create Static Site"

---

## ⚙️ إعدادات مهمة قبل النشر

### 1. تحديث vite.config.js

للنشر على مسار فرعي (مثل GitHub Pages):

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/", // أو '/repo-name/' لـ GitHub Pages
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 2. تحديث Firebase Config

للإنتاج، استخدم Environment Variables:

```bash
# .env.production
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... باقي المتغيرات
```

ثم في `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
};
```

### 3. تحديث Firestore Rules

في Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**ملاحظة:** للإنتاج، استخدم قواعد أكثر أماناً!

---

## 📝 ملف .gitignore

تأكد من وجود:

```
# Environments
.env
.env.local
.env.production
.env.production.local

# Build
dist
dist-ssr
*.local
```

---

## ✅ Checklist قبل النشر

- [ ] بناء المشروع بنجاح: `npm run build`
- [ ] اختبار البناء: `npm run preview`
- [ ] تكوين Firebase للإنتاج
- [ ] تحديث Firestore Rules
- [ ] إخفاء API Keys (استخدم .env)
- [ ] اختبار على الموبايل
- [ ] اختبار التقارير
- [ ] اختبار المهام الفرعية

---

## 🎯 الطريقة الموصى بها (Vercel)

### لماذا Vercel؟

1. **الأسهل** - بدون تعديلات على الكود
2. **الأسرع** - نشر في دقائق
3. **مجاني** - بدون حدود معقولة
4. **تلقائي** - ينشر عند كل push

### خطوات سريعة:

```bash
# 1. ارفع على GitHub
git add .
git commit -m "Ready for deployment"
git push

# 2. اذهب لـ vercel.com
# 3. Import project من GitHub
# 4. اضغط Deploy
# 5. انتهى! 🎉
```

---

## 🔧 حل المشاكل الشائعة

### المشكلة: npm run deploy لا يعمل

**السبب:** لا يوجد سكريبت deploy

**الحل:** تم إضافته الآن! جرّب:

```bash
npm run deploy
```

---

### المشكلة: الصفحات لا تعمل بعد النشر

**السبب:** المسارات (routing)

**الحل:** أضف ملف `public/_redirects` (لـ Netlify):

```
/*    /index.html   200
```

أو `public/404.html` (لـ GitHub Pages) - نسخة من `index.html`

---

### المشكلة: Firebase لا يعمل بعد النشر

**السبب:** CORS أو قواعد Firestore

**الحل:**

1. تحقق من Firebase Console → Authentication → Authorized domains
2. أضف domain الموقع المنشور
3. تحقق من Firestore Rules

---

## 📊 مقارنة خيارات النشر

| المنصة               | السعر | السرعة | السهولة | التلقائي |
| -------------------- | ----- | ------ | ------- | -------- |
| **Vercel**           | مجاني | ⚡⚡⚡ | ⭐⭐⭐  | ✅       |
| **Netlify**          | مجاني | ⚡⚡   | ⭐⭐⭐  | ✅       |
| **GitHub Pages**     | مجاني | ⚡     | ⭐⭐    | ✅       |
| **Firebase Hosting** | مجاني | ⚡⚡   | ⭐⭐    | ❌       |
| **Render**           | مجاني | ⚡⚡   | ⭐⭐    | ✅       |

---

## 🚀 النشر السريع (30 ثانية)

### استخدم Vercel:

```bash
# 1. ثبت Vercel CLI
npm i -g vercel

# 2. انشر
vercel

# سيسألك بعض الأسئلة:
# - Setup and deploy? Yes
# - Which scope? اختر حسابك
# - Link to existing project? No
# - Project name? habit-tracker
# - Directory? ./
# - Override settings? No

# انتهى! سيعطيك رابط فوراً 🎉
```

---

## 🌐 بعد النشر

### احصل على الرابط:

```
https://your-project.vercel.app
```

### شاركه:

- 📱 مع الموبايل
- 💻 مع أي جهاز
- 🌍 مع العالم!

### تحديثات تلقائية:

```bash
git add .
git commit -m "Update"
git push

# Vercel سينشر التحديثات تلقائياً!
```

---

## 📂 الملفات المعدلة:

✅ `package.json` - إضافة سكريبت deploy

---

## 🎊 الآن جرّب:

### الطريقة 1: GitHub Pages

```bash
# 1. عدّل vite.config.js (أضف base)
# 2. ارفع على GitHub
# 3. نفذ:
npm run deploy
```

### الطريقة 2: Vercel (الأسهل)

```bash
npm i -g vercel
vercel
```

---

**أي طريقة تفضل؟** سأساعدك في النشر! 🚀
