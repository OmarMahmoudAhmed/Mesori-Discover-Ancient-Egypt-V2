/*
 * =====================================================
 * QuizGroupPage.jsx - صفحة اختيار المرحلة
 * =====================================================
 *
 * هذه الصفحة تظهر عند الضغط على بطاقة مستوى في الصفحة الرئيسية.
 * تعرض قائمة بالمراحل الخمس داخل هذا المستوى:
 *
 * ┌─────────────────────────────────────────────────┐
 * │  <رجوع                              [إعدادات]   │
 * │      [الشعار الفرعوني]  [شخصية المستكشف]       │
 * │      Level 1         [أيقونة]                   │
 * │           سهل                                   │
 * │      اختر المرحلة                               │
 * │  ┌───────────────────────────────────────────┐  │
 * │  │ [نقاط] 100 نقطة  │  [أنبوب] 10 اختبارات    │  │
 * │  └───────────────────────────────────────────┘  │
 * │  ┌──────────────────────────────────────────┐   │
 * │  │ 1  [صورة]  البدايات        [ابدأ >]     │   │
 * │  ├──────────────────────────────────────────┤   │
 * │  │ 2  [صورة]  الحضارة         [قفل مقفول]  │   │
 * │  └──────────────────────────────────────────┘   │
 * └─────────────────────────────────────────────────┘
 * =====================================================
 */

import React from 'react';
import AppWrapper        from '../components/layout/AppWrapper';
import Header            from '../components/layout/Header';
import BottomNav         from '../components/layout/BottomNav';
import EgyptianLogo      from '../components/shared/EgyptianLogo.png';
import ExplorerCharacter from '../components/shared/ExplorerCharacter';
import { useApp }        from '../context/AppContext';

function QuizGroupPage() {

  /*
   * نجلب من Context:
   * pageData     = { levelId: X } المُمررة عند الضغط على بطاقة المستوى
   * userProfile  = لعرض شخصية المستخدم
   * navigateTo   = للتنقل لصفحة الاختبار
   * goBack       = للرجوع للصفحة السابقة
   */
  const { pageData, userProfile, navigateTo, goBack, levelsData } = useApp();

  /*
   * نجد بيانات المستوى المحدد من قائمة levelsData
   * باستخدام levelId من pageData
   *
   * find() = تبحث في المصفوفة وتُعيد العنصر الأول الذي يطابق الشرط
   * || levelsData[0] = احتياطياً إذا لم يُحدد levelId نعرض المستوى الأول
   */
  const currentLevel = levelsData.find(l => l.id === pageData?.levelId)
                       || levelsData[0];

  /*
   * handleStartStage - دالة بدء مرحلة معينة
   * @param stage {object} - بيانات المرحلة المختارة
   */
  const handleStartStage = (stage) => {
    if (!stage.isUnlocked) return; /* لا تفعل شيئاً إذا كانت مقفولة */
    navigateTo('quiz', {
      levelId: currentLevel.id,
      stageId: stage.id,
    });
  };

  return (
    <AppWrapper>
      <Header showBack={true} onBack={goBack} />

      <main
        className="flex-1 overflow-y-auto app-scroll"
        style={{ paddingBottom: '96px' }}
      >

        {/* ===== قسم الرأس: الشعار والشخصية ===== */}
        <div className="flex items-end justify-between px-4 pt-2">

          {/* الشعار في اليمين */}
          <img
            src={EgyptianLogo}
            alt="شعار ميسوري"
            width={120}
            height={120}
            className="drop-shadow-lg"
          />

          {/* معلومات المستوى في المنتصف */}
          <div className="flex-1 flex flex-col items-center pb-2">
            {/* شارة Level X */}
            <div
              className="px-5 py-1.5 rounded-full mb-2"
              style={{ backgroundColor: '#2D6A3F' }}
            >
              <span
                className="font-bold text-white text-base"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {currentLevel.nameEn}
              </span>
            </div>

            {/* اسم الصعوبة بالعربية */}
            <h1
              className="font-black text-3xl"
              style={{
                fontFamily: "'Cairo', sans-serif",
                color:      '#2D6A3F',
              }}
            >
              {currentLevel.nameAr}
            </h1>

            {/*
              * الأيقونة
              * 🖼️ صورة المستوى (نفس iconSrc المُستخدَم في بطاقة المستوى بالصفحة الرئيسية)
              */}
            <img
              src={currentLevel.iconSrc}
              alt={currentLevel.nameAr}
              width={40}
              height={40}
              style={{ objectFit: 'contain', marginTop: '4px' }}
            />

            {/* عنوان فرعي */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-12 h-px" style={{ backgroundColor: '#C8922A' }} />
              <span
                className="text-sm font-semibold"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  color:      '#8B4513',
                }}
              >
                اختر المرحلة
              </span>
              <div className="w-12 h-px" style={{ backgroundColor: '#C8922A' }} />
            </div>
          </div>

          {/* الشخصية في اليسار */}
          <ExplorerCharacter size={90} gender={userProfile.character} />
        </div>


        {/* ===== شارات الإحصائيات ===== */}
        <div
          className="mx-4 mb-4 rounded-2xl p-3 flex items-center justify-around"
          style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid rgba(200,146,42,0.2)' }}
        >
          {/* النقاط */}
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#2D6A3F' }}
            >
              {/* 🖼️ صورة مطلوبة: /assets/icons/quiz-group/points.png (18×18px، أبيض) */}
              <img src="/assets/icons/quiz-group/points.png" alt="" width={18} height={18} />
            </div>
            <div>
              <p className="font-black text-lg" style={{ color: '#3D2B1F', fontFamily: "'Cairo', sans-serif", lineHeight: 1 }}>
                {currentLevel.maxPoints}
              </p>
              <p className="text-xs" style={{ color: '#8B5A2B', fontFamily: "'Cairo', sans-serif" }}>
                نقطة ممكنة
              </p>
            </div>
          </div>

          {/* فاصل عمودي */}
          <div className="w-px h-10" style={{ backgroundColor: 'rgba(200,146,42,0.3)' }} />

          {/* الاختبارات */}
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#1A7F8E' }}
            >
              {/* 🖼️ صورة مطلوبة: /assets/icons/quiz-group/quizzes.png (18×18px، أبيض) */}
              <img src="/assets/icons/quiz-group/quizzes.png" alt="" width={18} height={18} />
            </div>
            <div>
              <p className="font-black text-lg" style={{ color: '#3D2B1F', fontFamily: "'Cairo', sans-serif", lineHeight: 1 }}>
                {currentLevel.quizCount}
              </p>
              <p className="text-xs" style={{ color: '#8B5A2B', fontFamily: "'Cairo', sans-serif" }}>
                اختبارات
              </p>
            </div>
          </div>
        </div>


        {/* ===== قائمة المراحل ===== */}
        <div className="px-4 space-y-3">
          {currentLevel.stages.map((stage, index) => (

            <div
              key={stage.id}
              onClick={() => handleStartStage(stage)}
              className={`
                rounded-2xl overflow-hidden
                flex items-center gap-3 p-4
                transition-all duration-200
                ${stage.isUnlocked
                  ? 'cursor-pointer press-effect active:scale-98 shadow-card'
                  : 'cursor-not-allowed opacity-80'
                }
              `}
              style={{
                backgroundColor: 'white',
                border: stage.isUnlocked
                  ? '1.5px solid rgba(45,106,63,0.2)'
                  : '1.5px solid rgba(150,150,150,0.2)',
              }}
            >

              {/* رقم المرحلة */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#2D6A3F' }}
              >
                <span className="font-black text-white text-sm"
                  style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {index + 1}
                </span>
              </div>

              {/*
                * صورة المرحلة (أو أيقونة القفل إذا كانت مقفولة)
                * 🖼️ صورة المرحلة: stage.imageSrc (معرّفة في data/levels.js)
                * 🖼️ صورة القفل: /assets/icons/quiz-group/lock-large.png (32×32px)
                */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: stage.isUnlocked
                    ? '#F4E2BC'
                    : '#E5E7EB',
                }}
              >
                {stage.isUnlocked ? (
                  <img
                    src={stage.imageSrc}
                    alt={stage.title}
                    width={32}
                    height={32}
                    style={{ objectFit: 'contain' }}
                  />
                ) : (
                  <img
                    src="/assets/icons/quiz-group/lock-large.png"
                    alt="مقفولة"
                    width={32}
                    height={32}
                    style={{ objectFit: 'contain' }}
                  />
                )}
              </div>

              {/* نص المرحلة */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-bold text-base truncate"
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    color: stage.isUnlocked ? '#2D6A3F' : '#6B7280',
                  }}
                >
                  {stage.title}
                </h3>
                <p
                  className="text-xs mt-0.5 leading-relaxed"
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    color: stage.isUnlocked ? '#5A3A1A' : '#9CA3AF',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {stage.isUnlocked ? stage.description : stage.unlockCondition}
                </p>
              </div>

              {/* زر البدء أو القفل */}
              {stage.isUnlocked ? (
                <button
                  className="
                    flex-shrink-0 flex items-center gap-1.5
                    px-4 py-2.5 rounded-xl
                    font-bold text-white text-sm
                    press-effect
                  "
                  style={{
                    backgroundColor: '#2D6A3F',
                    fontFamily: "'Cairo', sans-serif",
                  }}
                  onClick={(e) => { e.stopPropagation(); handleStartStage(stage); }}
                >
                  ابدأ
                  {/* أيقونة Flaticon Uicons (fi fi-rr-arrow-small-right) بدلاً من صورة PNG */}
                  <i className="fi fi-rr-arrow-small-right" aria-hidden="true" style={{ fontSize: '14px', color: '#FFFFFF' }} />
                </button>
              ) : (
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: '#F3F4F6' }}
                >
                  {/* 🖼️ صورة مطلوبة: /assets/icons/quiz-group/lock-small.png (20×20px) */}
                  <img src="/assets/icons/quiz-group/lock-small.png" alt="مقفولة" width={20} height={20} />
                </div>
              )}

            </div>
          ))}
        </div>

      </main>

      <BottomNav activePage="home" />
    </AppWrapper>
  );
}

export default QuizGroupPage;
