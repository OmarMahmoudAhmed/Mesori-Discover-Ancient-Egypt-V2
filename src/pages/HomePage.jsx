/*
 * =====================================================
 * HomePage.jsx - الصفحة الرئيسية للتطبيق
 * =====================================================
 *
 * ┌─────────────────────────────────────────────────┐
 * │  AppWrapper (حاوية التطبيق الكاملة)             │
 * │  ┌───────────────────────────────────────────┐  │
 * │  │  Header (🔔 إشعارات | ⚔️ 1ضد1 | ⚙️ إعدادات) │  │
 * │  ├───────────────────────────────────────────┤  │
 * │  │  main (flex-col يملأ المساحة المتبقية)     │  │
 * │  │  ├── HeroSection     (ثابت الحجم، مضغوط)  │  │
 * │  │  ├── LevelsGrid      (flex-1 — يملأ الباقي)│  │
 * │  │  └── ProgressSection (ثابت الحجم)         │  │
 * │  ├───────────────────────────────────────────┤  │
 * │  │  BottomNav (INFO | 🏠 | LEADERBOARD)      │  │
 * │  └───────────────────────────────────────────┘  │
 * └─────────────────────────────────────────────────┘
 *
 * ⬅️ main بقى flex flex-col بدل تدفّق عادي: HeroSection
 *   وProgressSection بحجمهم الطبيعي (flex-shrink-0 داخلهم)،
 *   وLevelsGrid ياخد كل المساحة المتبقية (flex-1 min-h-0) وتتقلّص/
 *   تكبر كروته معاها. الهدف: الصفحة كلها تتظبط في ارتفاع الشاشة
 *   على أي هاتف عادي من غير تمرير، وده بيتحقق تلقائياً على أي
 *   ارتفاع شاشة (مش مضبوط على جهاز واحد بعينه) لأن القسم المرن
 *   هو اللي بياخد أو يسيب المساحة الزيادة/الناقصة.
 * ⬅️ overflow-y-auto اتسابت كـ"شبكة أمان" بس، مش اتشالت خالص —
 *   لو جهاز نادر جداً (شاشة قصيرة جداً/تكبير خط النظام لأقصى حد)
 *   لسه محتاج بكسلات زيادة، هيقدر يعمل سكرول خفيف بدل ما يختفي
 *   جزء من المحتوى (كرت كامل مثلاً) نهائياً بلا داعي. في الاستخدام
 *   العادي على أي هاتف حديث مفيش حاجة تتمرّر أصلاً.
 * =====================================================
 */

import React from 'react';

/* --- استيراد مكوّنات الهيكل (Layout) --- */
import AppWrapper from '../components/layout/AppWrapper';
import Header     from '../components/layout/Header';
import BottomNav  from '../components/layout/BottomNav';

/* --- استيراد مكوّنات الصفحة الرئيسية --- */
import HeroSection     from '../components/home/HeroSection';
import LevelsGrid      from '../components/home/LevelsGrid';
import ProgressSection from '../components/home/ProgressSection';

function HomePage() {
  return (
    <AppWrapper>

      <Header showNotifications={true} showVsIcon={true} />

      <main
        className="flex-1 min-h-0 overflow-y-auto app-scroll flex flex-col"
        style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
      >
        <HeroSection />
        <LevelsGrid />
        <ProgressSection />
      </main>

      <BottomNav activePage="home" />

    </AppWrapper>
  );
}

export default HomePage;
