/*
 * =====================================================
 * HeroSection.jsx - قسم الترحيب (Hero) المضغوط في الصفحة الرئيسية
 * =====================================================
 * ⬅️ أُعيد تصميمه ليكون مضغوطاً بما يكفي لظهور الصفحة الرئيسية
 *   كاملة (Hero + المستويات + التقدّم) بدون تمرير على شاشة هاتف
 *   عادية — بدل الشعار الكبير (155px) + عنوانين منفصلين (Mesori +
 *   شارة "ميسوري" الكبيرة) + بطاقة ترحيب منفصلة كانت بتاخد وحدها
 *   أكتر من ثلث ارتفاع الشاشة. الاسمين دلوقتي بجانب الشعار في عمود
 *   واحد مضغوط، وبطاقة الترحيب والشخصية في صف واحد جنبهم.
 * ⬅️ الشعار دلوقتي متحرك: توهّج ذهبي نابض (pulse-gold، مُعرّف
 *   بالفعل في tailwind.config.js) + طفو خفيف لأعلى/أسفل عبر
 *   framer-motion، بدل ما كان صورة ثابتة تماماً. يحترم
 *   prefers-reduced-motion.
 * ⬅️ flex-shrink-0 على عمود الشعار والشخصية، min-w-0 على النص
 *   المرن بينهم — نفس درس إصلاح صف رأس LeaderboardPage (راجع
 *   LeaderboardPage.jsx): بدونهم، نص طويل ممكن يفرض عرض أدنى يدفع
 *   عناصر تانية بره الإطار على شاشة ضيّقة.
 * =====================================================
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import logoImage from '../shared/EgyptianLogo.png';
import ExplorerCharacter from '../shared/ExplorerCharacter';
import { useApp } from '../../context/AppContext';

/* الشعار المتحرك: توهّج + طفو خفيف (بدل تدوير كامل — شكله غير متماثل) */
function AnimatedLogo({ size = 50 }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: size * 1.2, height: size * 1.2 }}
    >
      <div
        className={prefersReducedMotion ? '' : 'animate-pulse-gold'}
        style={{
          position: 'absolute',
          width: size * 1.05,
          height: size * 1.05,
          borderRadius: '9999px',
          backgroundColor: 'rgba(200,146,42,0.3)',
        }}
      />
      <motion.img
        src={logoImage}
        alt="شعار ميسوري"
        width={size}
        height={size}
        className="drop-shadow-lg relative"
        style={{ display: 'block' }}
        animate={prefersReducedMotion ? {} : { y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function HeroSection() {

  const { userProfile } = useApp();

  return (
    <section className="pt-2 pb-2 px-4 animate-fade-in-up flex-shrink-0">

      <div className="flex items-center gap-2.5">

        {/* ===== الشعار المتحرك + الاسمين (عمود ثابت العرض) ===== */}
        <div className="flex flex-col items-center flex-shrink-0" style={{ width: 74 }}>
          <AnimatedLogo size={50} />
          <span
            className="font-black mt-0.5"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '14px',
              color: '#3D2B1F',
              letterSpacing: '0.5px',
              lineHeight: 1.1,
            }}
          >
            Mesori
          </span>
          <span
            className="font-bold"
            style={{ fontFamily: "'Cairo', sans-serif", fontSize: '10px', color: '#805D1B', lineHeight: 1.2 }}
          >
            ميسوري
          </span>
        </div>

        {/* ===== بطاقة الترحيب + الشخصية (تملأ الباقي، نصها ينكمش بأمان) ===== */}
        <div
          className="flex-1 min-w-0 rounded-2xl px-3 py-2 flex items-center gap-2"
          style={{
            backgroundColor: 'rgba(255,255,255,0.7)',
            border: '1.5px solid rgba(200,146,42,0.25)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <p
            className="flex-1 min-w-0 font-semibold"
            style={{
              fontFamily: "'Cairo', sans-serif",
              fontSize: '12px',
              color: '#3D2B1F',
              lineHeight: '1.45',
            }}
          >
            اختر معرفتك{' '}
            <span style={{ color: '#8B4513', fontWeight: 700 }}>بتاريخ مصر القديم!</span>
          </p>

          <div className="flex-shrink-0" style={{ marginBottom: '-6px' }}>
            <ExplorerCharacter size={46} gender={userProfile.character} />
          </div>
        </div>

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
