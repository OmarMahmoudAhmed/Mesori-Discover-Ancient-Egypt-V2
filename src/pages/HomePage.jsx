/*
 * =====================================================
 * HomePage.jsx - الصفحة الرئيسية للتطبيق
 * =====================================================
 *
 * هذه الصفحة هي "البوابة" الرئيسية للتطبيق.
 * تجمع كل المكوّنات الفرعية في تسلسل منطقي:
 *
 * ┌─────────────────────────────────────────────────┐
 * │  AppWrapper (حاوية التطبيق الكاملة)             │
 * │  ┌───────────────────────────────────────────┐  │
 * │  │  Header (🔇 صوت | ⚙️ إعدادات)            │  │
 * │  ├───────────────────────────────────────────┤  │
 * │  │  main (منطقة التمرير)                     │  │
 * │  │  ├── HeroSection   (الشعار + الترحيب)    │  │
 * │  │  ├── LevelsGrid    (بطاقات المستويات)    │  │
 * │  │  └── ProgressSection (شريط التقدم)       │  │
 * │  ├───────────────────────────────────────────┤  │
 * │  │  BottomNav (INFO | 🏠 | LEADERBOARD)      │  │
 * │  └───────────────────────────────────────────┘  │
 * └─────────────────────────────────────────────────┘
 *
 * ملاحظة حول التمرير:
 * - الـ main يتمرر بشكل مستقل (overflow-y: auto)
 * - paddingBottom = 96px لتجنب أن يختبئ المحتوى خلف BottomNav الثابت
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

    /*
     * AppWrapper يوفر:
     * - حاوية max-w-md للموبايل
     * - خلفية رملية فرعونية
     * - توسيط على الشاشات الكبيرة
     * - الزخارف الجانبية
     */
    <AppWrapper>

      {/*
        * Header مع إظهار جرس الإشعارات وأيقونة "1 ضد 1"
        * showNotifications={true} → يعرض جرس الإشعارات بدلاً من زر الرجوع
        * showVsIcon={true}        → يعرض أيقونة "1 ضد 1" في المنتصف
        * في الصفحة الرئيسية لا يوجد "رجوع"
        */}
      <Header showNotifications={true} showVsIcon={true} />

      {/*
        * المنطقة القابلة للتمرير
        * ─────────────────────────────────────────
        * overflow-y: auto  = يُمكّن التمرير العمودي
        * flex-1            = تأخذ كل المساحة المتبقية
        *                     بين Header و BottomNav
        * paddingBottom 96px= مسافة تمنع المحتوى من
        *                     الاختباء خلف BottomNav الثابت
        *                     (ارتفاع BottomNav ≈ 80-96px)
        * app-scroll        = كلاس CSS لشريط تمرير مخصص
        *                     (تعريفه في index.css)
        */}
      <main
        className="flex-1 overflow-y-auto app-scroll"
        style={{ paddingBottom: '96px' }}
      >

        {/*
          * HeroSection - القسم الأول
          * يعرض: الشعار + اسم التطبيق + الترحيب + الشخصية
          */}
        <HeroSection />

        {/*
          * فاصل بصري خفيف بين الأقسام
          * نقاط ذهبية زخرفية
          */}
        <div className="flex items-center justify-center gap-2 mb-2 opacity-40">
          <span style={{ color: '#C8922A', fontSize: '8px' }}>◆</span>
          <span style={{ color: '#C8922A', fontSize: '12px' }}>◆</span>
          <span style={{ color: '#C8922A', fontSize: '8px' }}>◆</span>
        </div>

        {/*
          * LevelsGrid - بطاقات المستويات الخمسة
          * يعرض: 3 بطاقات في الصف الأول، 2 في الثاني
          */}
        <LevelsGrid />

        {/*
          * ProgressSection - شريط التقدم الكلي
          * يعرض: مجموع النقاط + شريط تصاعدي + لقب المستخدم
          */}
        <ProgressSection />

      </main>

      {/*
        * BottomNav - شريط التنقل السفلي الثابت
        * activePage='home' = يُضيء زر الصفحة الرئيسية
        */}
      <BottomNav activePage="home" />

    </AppWrapper>
  );
}

export default HomePage;
