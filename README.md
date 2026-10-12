<<<<<<< HEAD
# 🏢 موقع ومنظومة شركة المحترز للمقاولات العامة والحلول الرقمية

مشروع هندسي متكامل يجمع بين:
1. **واجهة سينمائية تفاعلية فائقة الإبهار** لموقع الشركة (المقاولات والحلول الرقمية) باستخدام تقنيات ثلاثية الأبعاد (Three.js، GSAP، ScrollTrigger، Lenis، Vanilla Tilt).
2. **شاشات وبوابات تفاصيل غامرة (Immersive Portals)** لاستعراض مشاريع المقاولات المعتمدة ومعرض الحلول البرمجية مع شاشات محاكاة حية وتفاعلية.
3. **خادم سحابي (Serverless Backend API)** مبني بـ Next.js و TypeScript ومربوط بـ Supabase مع محرك الأمان وفحص الصلاحيات قبل كل فعل (`action_mode`).

---

## 🚀 التشغيل والمعاينة المحلية (Local Development)

### 1. معاينة موقع الشركة التفاعلي:
* افتح المجلد في المحرر واضغط بزر الفأرة الأيمن على `almuhtaraz-site/index.html` واختر **Open with Live Server** (أو اضغط زر `Go Live` في أسفل الشاشة).

### 2. تشغيل كود الخادم ومحرك فحص الصلاحيات (Next.js):
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:3000` للدخول إلى لوحة فحص الصلاحيات ومسارات الـ API.

---

## 🗄️ إعداد قاعدة البيانات (Supabase)

1. أنشئ مشروعاً جديداً في [Supabase](https://supabase.com).
2. افتح **SQL Editor** والصق محتوى ملف [`schema.sql`](./schema.sql) واضغط **Run**.
3. انسخ المفاتيح وضعها في ملف `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🌐 النشر على GitHub و Vercel

### أولاً: الرفع على GitHub:
```bash
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

### ثانياً: النشر على Vercel:
1. استورد المستودع في [Vercel](https://vercel.com).
2. في قسم **Environment Variables**، أضف المتغيرات الموجودة في ملف [`env.vercel.txt`](./env.vercel.txt).
3. اضغط **Deploy**.

---

## 📁 هيكلية المشروع
* `almuhtaraz-site/`: الواجهة التفاعلية (HTML/CSS/JS/Three.js) ومجلدات الصور والبيانات.
* `src/app/api/`: مسارات الخادم (تسجيل الدخول، استقبال الرسائل، جدار الصلاحيات، الأفعال المعلقة).
* `src/lib/actionGuard.ts`: محرك فحص وتنفيذ الصلاحيات (`auto` / `confirm` / `deny`).
* `schema.sql`: المخطط الشامل لقاعدة البيانات.
* `رحلة-العمل.md`: وثيقة تتبع مراحل العمل والتنفيذ.
=======
# almuhtaraz-site
>>>>>>> a74c4ee81a2ed0c86e9b4f1cd68518e8c531318c
# almuhtaraz-site
