/*
 * =====================================================
 * HeroSection.jsx - قسم الترحيب (Hero) في الصفحة الرئيسية
 * =====================================================
 *
 * هذا المكوّن هو أول ما يراه المستخدم.
 * يتكون من:
 * ┌────────────────────────────────────────────────┐
 * │         [شعار ميسوري - القوس الفرعوني]        │
 * │                   Mesori                       │
 * │                  ميسوري                        │
 * │   مرحباً بك في ميسوري  [شخصية المستكشف]      │
 * │   اختر معرفتك بالتاريخ المصري القديم!         │
 * └────────────────────────────────────────────────┘
 *
 * التصميم يستخدم Flexbox لمحاذاة:
 * - الشعار في المنتصف
 * - النص والشخصية جنباً إلى جنب (row)
 * =====================================================
 */

import React from 'react';
import logoImage from '../shared/EgyptianLogo.png'; // ⬅️ استيراد صورة اللوجو (عدّل المسار حسب مشروعك)
import ExplorerCharacter from '../shared/ExplorerCharacter';
import { useApp } from '../../context/AppContext';

function HeroSection() {

  /*
   * نجلب بيانات المستخدم من Context
   * character = 'boy' أو 'girl' لتحديد شخصية المستكشف
   */
  const { userProfile } = useApp();

  return (
    /*
     * قسم الترحيب الكامل
     * bg-hero-pattern: تدرج لوني خفيف من الأسفل
     * pt-2, pb-4, px-5: مسافات داخلية
     * animate-fade-in-up: يظهر بتأثير انبثاق من الأسفل
     */
    <section className="pt-2 pb-6 px-5 animate-fade-in-up">

      {/* ===== الشعار الفرعوني في المنتصف ===== */}
      <div className="flex justify-center mb-3">
        {/* ⬇️ تم استبدال <EgyptianLogo /> بصورة مباشرة */}
        <img
          src={logoImage}
          alt="شعار ميسوري"
          width={155}
          height={155}
          className="drop-shadow-lg"
        />
      </div>

      {/* ===== اسم التطبيق ===== */}

      {/* الاسم بالإنجليزية "Mesori" */}
      <h1
        className="text-center font-black"
        style={{
          fontFamily: "'Cinzel', serif",   /* خط روماني نبيل للاسم الإنجليزي */
          fontSize:   '38px',
          color:      '#3D2B1F',           /* بني داكن */
          letterSpacing: '1px',
          textShadow: '0 2px 4px rgba(61,43,31,0.15)',
          lineHeight: 1.1,
        }}
      >
        Mesori
      </h1>

      {/* الاسم بالعربية "ميسوري" داخل شارة خضراء */}
      <div className="flex justify-center mt-1 mb-3">
        <div
          className="px-5 py-1.5 rounded-full"
          style={{ backgroundColor: '#3D2B1F' }}
        >
          <span
            className="font-black text-xl"
            style={{
              fontFamily: "'Cairo', sans-serif",
              color:      '#C8922A',         /* ذهبي */
            }}
          >
            ميسوري
          </span>
        </div>
      </div>

      {/* ===== صف النص والشخصية ===== */}
      {/*
        * هنا نضع النص الترحيبي والشخصية جنباً إلى جنب
        * items-end: محاذاة العناصر من الأسفل
        */}
      <div className="flex items-end justify-between gap-2">

        {/* النص الترحيبي */}
        <div
          className="flex-1 rounded-2xl p-4"
          style={{
            /* خلفية بيضاء شفافة */
            backgroundColor: 'rgba(255,255,255,0.7)',
            border:          '1.5px solid rgba(200,146,42,0.25)',
            backdropFilter:  'blur(4px)',
          }}
        >
          {/* نجوم زخرفية */}
          <div className="flex gap-1 mb-1.5">
            <span style={{ color: '#C8922A', fontSize: '14px' }}>✦</span>
            <span style={{ color: '#C8922A', fontSize: '10px', marginTop:'2px' }}>✦</span>
          </div>

          {/* النص الترحيبي الرئيسي */}
          <p
            className="font-semibold leading-relaxed"
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontSize:   '14px',
              color:      '#3D2B1F',
              lineHeight: '1.6',
            }}
          >
            مرحباً بك في ميسوري
            <br />
            <span style={{ color: '#8B4513', fontWeight: 700 }}>
              اختر معرفتك
            </span>
            {' '}بالتاريخ المصري القديم!
          </p>
        </div>

        {/* شخصية المستكشف على اليمين */}
        {/*
          * أسباب استخدام negative margin-bottom:
          * نريد الشخصية أن "تطفو" قليلاً فوق الحاوية
          * مما يعطي إحساساً بالحيوية والتفاعل
          */}
        <div className="flex-shrink-0" style={{ marginBottom: '-8px' }}>
          <ExplorerCharacter
            size={100}
            gender={userProfile.character}
          />
        </div>

      </div>

    </section>
  );
}

export default HeroSection;