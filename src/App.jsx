/*
 * =====================================================
 * App.jsx - المكوّن الجذر للتطبيق
 * =====================================================
 *
 * هذا الملف هو "محطة التوزيع" الرئيسية.
 * يقوم بـ:
 * 1. تغليف التطبيق بـ AppProvider (مزود البيانات)
 * 2. اختيار الصفحة الصحيحة للعرض حسب currentPage
 *
 * هيكل المكوّنات:
 * ┌─────────────────────────────────────────┐
 * │  AppProvider (مزود البيانات العامة)     │
 * │  └── AppContent                         │
 * │       ├── (غير مسجّل دخول) → LoginPage  │
 * │       ├── (لسه ما اختارش بياناته) →     │
 * │       │        OnboardingPage           │
 * │       └── (جاهز) → الصفحات المعتادة:    │
 * │            HomePage / QuizGroupPage /   │
 * │            QuizPage / LeaderboardPage / │
 * │            ProfilePage                  │
 * └─────────────────────────────────────────┘
 *
 * لماذا AppContent منفصل عن App؟
 * ─────────────────────────────────────────────
 * useApp() يجب استخدامه داخل AppProvider.
 * إذا كتبنا useApp() مباشرة في App() فسنحصل على خطأ
 * لأن AppProvider لم يُهيَّأ بعد عند تنفيذ App().
 * الحل: وضع منطق القراءة (useApp) في AppContent
 * ومنطق التهيئة (AppProvider) في App.
 * =====================================================
 */

import React from 'react';

/* استيراد مزود البيانات والـ Hook */
import { AppProvider, useApp } from './context/AppContext';

/* استيراد جميع الصفحات */
import LoginPage        from './pages/LoginPage';
import OnboardingPage   from './pages/OnboardingPage';
import HomePage        from './pages/HomePage';
import QuizGroupPage   from './pages/QuizGroupPage';
import QuizPage        from './pages/QuizPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage     from './pages/ProfilePage';
import VsLobbyPage         from './pages/VsLobbyPage';
import VsMatchPage         from './pages/VsMatchPage';
import DeveloperInfoPage   from './pages/DeveloperInfoPage';

/* شاشة تحميل بسيطة أثناء فحص الجلسة/البروفايل */
function SplashLoader() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ backgroundColor: '#0F2D18' }}
    >
      <div className="text-5xl animate-pulse">🏺</div>
    </div>
  );
}

/*
 * AppContent - المكوّن الداخلي
 * يقرأ currentPage من Context ويعرض الصفحة المناسبة
 *
 * switch/case = بنية شرطية تُقارن قيمة currentPage
 * مع قيم ثابتة وتُعيد الصفحة المقابلة
 */
function AppContent() {

  const { currentPage, session, authLoading, profileLoading, userProfile } = useApp();

  /*
   * بوابة تسجيل الدخول: بالترتيب —
   * 1) لسه بنفحص هل فيه جلسة محفوظة أصلاً؟ (لحظة واحدة عند فتح التطبيق)
   * 2) مفيش جلسة → صفحة الدخول/التسجيل
   * 3) فيه جلسة بس البروفايل لسه بيتحمّل → نفس شاشة التحميل
   * 4) البروفايل اتحمّل بس لسه ما اختارش اسمه/عمره/شخصيته → Onboarding
   * 5) كل حاجة جاهزة → التطبيق المعتاد
   */
  if (authLoading) return <SplashLoader />;
  if (!session) return <LoginPage />;
  if (profileLoading) return <SplashLoader />;
  if (!userProfile.onboardingCompleted) return <OnboardingPage />;

  /*
   * router بسيط مبني على switch/case
   * في المستقبل مع Next.js:
   * → كل صفحة ستكون ملف مستقل في مجلد /app
   * → مثل: /app/home/page.jsx, /app/quiz/page.jsx
   * → والتوجيه يكون بـ router.push('/home') بدلاً من navigateTo('home')
   */
  const renderPage = () => {
    switch (currentPage) {

      case 'home':
        /* الصفحة الرئيسية - الشاشة الأولى */
        return <HomePage />;

      case 'quiz-group':
        /* قائمة مراحل المستوى المحدد */
        return <QuizGroupPage />;

      case 'quiz':
        /* الاختبار الفعلي لمرحلة محددة */
        return <QuizPage />;

      case 'leaderboard':
        /* قائمة المتصدرين */
        return <LeaderboardPage />;

      case 'profile':
        /* الملف الشخصي والإحصائيات */
        return <ProfilePage />;

      case 'vs-mode':
        /* توافقاً مع أي رابط قديم يشاور على vs-mode (زرار Header) */
      case 'vs-lobby':
        /* بوابة نمط 1 ضد 1: عشوائي أو دعوة صديق */
        return <VsLobbyPage />;

      case 'vs-match':
        /* شاشة اللعب الفعلي (أو قبول/رفض دعوة) لمباراة محددة */
        return <VsMatchPage />;

      case 'developer-info':
        /* عن المطوّر (من قائمة الإعدادات) */
        return <DeveloperInfoPage />;

      default:
        /*
         * في حال وجود صفحة غير معروفة (لا يجب أن يحدث)
         * نعرض الصفحة الرئيسية كـ fallback
         */
        return <HomePage />;
    }
  };

  return renderPage();
}


/*
 * App - المكوّن الجذر النهائي
 * يُغلّف كل شيء بـ AppProvider
 *
 * هذا المكوّن هو ما يُصدَّر ويُستخدم في main.jsx
 */
function App() {
  return (
    /*
     * AppProvider يجب أن يحتضن جميع المكوّنات التي
     * تستخدم useApp() - أي الجميع تقريباً
     */
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
