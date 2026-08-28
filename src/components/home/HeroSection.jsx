/*
 * =====================================================
 * HeroSection.jsx - قسم الترحيب (Hero)
 * =====================================================
 * ⬅️ شعار كبير في المنتصف العلوي (بدون توهّج ذهبي، طفو خفيف بس)،
 *   والنص الترحيبي منفصل تماماً عن الشخصية.
 * ⬅️ إضافة: تأثير كتابة (Typed.js) على النص الترحيبي — بيتكتب
 *   حرف حرف عند دخول الصفحة بدل ما يظهر دفعة واحدة. min-height
 *   ثابت على الفقرة عشان الشخصية تحتها ما تقفزش لأعلى/أسفل وهي
 *   بتتكتب. يحترم prefers-reduced-motion (بيظهر النص كامل فوراً
 *   من غير أنيميشن لمن يفضّل تقليل الحركة).
 * =====================================================
 */

import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Typed from 'typed.js';
import logoImage from '../shared/EgyptianLogo.png';
import ExplorerCharacter from '../shared/ExplorerCharacter';
import { useApp } from '../../context/AppContext';

/* الشعار: طفو خفيف بس (بدون أي توهّج ذهبي) */
function AnimatedLogo({ size = 92 }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.img
      src={logoImage}
      alt="شعار ميسوري"
      width={size}
      height={size}
      className="drop-shadow-lg"
      style={{ display: 'block' }}
      animate={prefersReducedMotion ? {} : { y: [0, -4, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/* النص الترحيبي بتأثير كتابة (Typed.js) */
function TypedWelcomeText() {
  const typedEl = useRef(null);
  const typedInstance = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !typedEl.current) return;

    typedInstance.current = new Typed(typedEl.current, {
      strings: ['اختر معرفتك <span style="color:#8B4513;font-weight:700">بتاريخ مصر القديم!</span>'],
      typeSpeed: 32,
      startDelay: 200,
      showCursor: true,
      cursorChar: '|',
      contentType: 'html',
      loop: false,
    });

    return () => typedInstance.current?.destroy();
  }, [prefersReducedMotion]);

  return (
    <p
      dir="rtl"
      className="text-center font-semibold mt-2 px-4"
      style={{
        fontFamily: "'Cairo', sans-serif",
        fontSize: '13px',
        color: '#3D2B1F',
        lineHeight: 1.5,
        minHeight: '39px', /* حجز مساحة سطرين مقدماً عشان الشخصية تحتها ما تقفزش وقت الكتابة */
      }}
    >
      {prefersReducedMotion ? (
        <>
          اختر معرفتك <span style={{ color: '#8B4513', fontWeight: 700 }}>بتاريخ مصر القديم!</span>
        </>
      ) : (
        <span ref={typedEl} />
      )}
    </p>
  );
}

function HeroSection() {

  const { userProfile } = useApp();

  return (
    <section className="pt-3 pb-2 px-4 flex-shrink-0 flex flex-col items-center animate-fade-in-up">

      {/* ===== الشعار الكبير + الاسمين، في المنتصف العلوي ===== */}
      <AnimatedLogo size={92} />

      <span
        className="font-black mt-1"
        style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', color: '#3D2B1F', letterSpacing: '0.5px' }}
      >
        Mesori
      </span>
      <span
        className="font-bold"
        style={{ fontFamily: "'Cairo', sans-serif", fontSize: '12px', color: '#805D1B' }}
      >
        ميسوري
      </span>

      {/* ===== النص الترحيبي — بتأثير كتابة، سطر مستقل تماماً ===== */}
      <TypedWelcomeText />

      {/* ===== الشخصية — سطر مستقل لوحدها ===== */}
      <div className="mt-1.5">
        <ExplorerCharacter size={56} gender={userProfile.character} />
      </div>

      {/* فاصل بصري صغير (نقاط ذهبية) */}
      <div className="flex items-center justify-center gap-2 mt-2 opacity-40">
        <span style={{ color: '#C8922A', fontSize: '7px' }}>◆</span>
        <span style={{ color: '#C8922A', fontSize: '10px' }}>◆</span>
        <span style={{ color: '#C8922A', fontSize: '7px' }}>◆</span>
      </div>

    </section>
  );
}

export default HeroSection;
