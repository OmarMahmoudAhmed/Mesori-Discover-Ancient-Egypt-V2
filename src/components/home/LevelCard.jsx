/*
 * =====================================================
 * LevelCard.jsx - بطاقة المستوى الواحد (مع تأثيرات طيفية)
 * =====================================================
 */

import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';

/* ============================================================
   أنماط CSS للتأثيرات (حقن مرة واحدة)
   ============================================================ */
const spectralStyles = `
  @keyframes spectralBorderFlow {
    0%   { background-position: 0% 50%; }
    25%  { background-position: 60% 30%; }
    50%  { background-position: 100% 50%; }
    75%  { background-position: 40% 70%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes spectralFloat {
    0%, 100% { transform: translateY(0); }
    30%      { transform: translateY(-5px); }
    60%      { transform: translateY(-2px); }
    85%      { transform: translateY(-6px); }
  }

  @keyframes shimmerSweep {
    0%   { transform: translateX(-110%) skewX(-8deg); }
    100% { transform: translateX(110%) skewX(-8deg); }
  }

  @keyframes rippleExpand {
    0%   { transform: translate(-50%, -50%) scale(0); opacity: 0.7; }
    60%  { opacity: 0.35; }
    100% { transform: translate(-50%, -50%) scale(6); opacity: 0; }
  }

  @keyframes rippleEcho {
    0%   { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
    100% { transform: translate(-50%, -50%) scale(5.5); opacity: 0; }
  }

  .spectral-card-wrapper {
    position: relative;
    border-radius: 18px;
    padding: 2.8px;
    background-size: 350% 350%;
    animation: spectralBorderFlow 4.5s ease-in-out infinite,
               spectralFloat 5s ease-in-out infinite;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: box-shadow 0.5s cubic-bezier(0.25, 0, 0.25, 1),
                transform 0.4s cubic-bezier(0.25, 0, 0.25, 1);
    box-shadow: 0 6px 20px rgba(0,0,0,0.35);
    z-index: 1;
  }

  .spectral-card-wrapper:hover {
    box-shadow: 0 12px 32px rgba(0,0,0,0.45),
                0 0 18px 3px var(--glow-35),
                0 0 40px 8px var(--glow-18),
                0 0 80px 15px var(--glow-08);
    transform: translateY(-4px);
    z-index: 10;
    animation: spectralBorderFlow 3s ease-in-out infinite,
               spectralFloat 5s ease-in-out infinite;
  }

  .spectral-card-wrapper:active {
    transform: scale(0.96) translateY(-2px);
    transition: box-shadow 0.15s ease-out, transform 0.15s ease-out;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5),
                0 0 25px 6px var(--glow-50),
                0 0 55px 12px var(--glow-25);
  }

  .card-inner {
    position: relative;
    border-radius: 16px;  /* يناسب rounded-2xl */
    overflow: hidden;
    z-index: 2;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
  }

  .shimmer-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 15;
    background: linear-gradient(110deg,
        transparent 35%,
        rgba(255,255,255,0.04) 42%,
        rgba(255,255,255,0.14) 48%,
        rgba(255,255,255,0.18) 50%,
        rgba(255,255,255,0.14) 52%,
        rgba(255,255,255,0.04) 58%,
        transparent 65%);
    transform: translateX(-110%) skewX(-8deg);
    transition: transform 0.7s cubic-bezier(0.25, 0, 0.25, 1);
  }

  .spectral-card-wrapper:hover .shimmer-overlay {
    animation: shimmerSweep 0.65s cubic-bezier(0.25, 0, 0.25, 1) forwards;
  }

  .shimmer-flash {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 14;
    background: radial-gradient(ellipse at center,
        rgba(255,255,255,0.2) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease-out;
  }

  .spectral-card-wrapper:hover .shimmer-flash {
    opacity: 1;
    transition: opacity 0.15s ease-out;
  }

  .spectral-card-wrapper:active .shimmer-flash {
    opacity: 0.5;
    transition: opacity 0.08s ease-out;
    background: radial-gradient(ellipse at center,
        rgba(255,255,255,0.35) 0%, transparent 65%);
  }

  .ripple-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 20;
    overflow: hidden;
    border-radius: 16px;
  }

  .ripple-dot {
    position: absolute;
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    animation: rippleExpand 0.7s cubic-bezier(0.1, 0.6, 0.3, 1) forwards;
    pointer-events: none;
  }

  .ripple-dot.echo {
    animation:
      rippleExpand 0.7s cubic-bezier(0.1, 0.6, 0.3, 1) forwards,
      rippleEcho 1s cubic-bezier(0.1, 0.5, 0.3, 1) forwards;
  }

  /* تأثير أيقونة المستوى عند التحويم */
  .spectral-card-wrapper:hover .level-icon-img {
    transform: scale(1.08) translateY(-3px);
    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.35)) brightness(1.1);
    transition: transform 0.35s cubic-bezier(0.25, 0, 0.25, 1),
                filter 0.35s ease;
  }

  .spectral-card-wrapper:active .level-icon-img {
    transform: scale(0.95);
    transition: transform 0.1s ease-out;
  }
`;

function LevelCard({ level }) {
  const { navigateTo } = useApp();

  /* --- حالة التموجات (Ripples) --- */
  const [ripples, setRipples] = useState([]);
  const rippleIdRef = useRef(0);

  const handlePress = (e) => {
    createRipple(e);

    if (level.isUnlocked) {
      navigateTo('quiz-group', { levelId: level.id });
    } else {
      alert(`🔒 المستوى ${level.nameAr} مقفول حالياً!\nأكمل المستوى السابق لفتحه.`);
    }
  };

  const createRipple = (e) => {
    const wrapper = e.currentTarget;
    const rect = wrapper.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? rect.left + rect.width / 2;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? rect.top + rect.height / 2;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newRipple = {
      id: ++rippleIdRef.current,
      x,
      y,
      size,
      isEcho: Math.random() > 0.5,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1000);
  };

  /* استخراج ألوان الطيف من لون المستوى */
  const hexToRgb = (hex) => {
    if (!hex || !hex.startsWith('#')) return { r: 180, g: 140, b: 60 };
    const h = hex.replace('#', '');
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16),
    };
  };

  const glowBase = hexToRgb(level.headerBg || level.badgeText || '#b48c3c');
  const glowR = glowBase.r;
  const glowG = glowBase.g;
  const glowB = glowBase.b;

  const spectralBorderGradient = `
    linear-gradient(60deg,
      rgba(${glowR},${glowG},${glowB},0.2) 0%,
      rgba(${glowR},${glowG},${glowB},0.5) 20%,
      rgba(${glowR},${glowG},${glowB},0.1) 35%,
      transparent 45%,
      rgba(${glowR},${glowG},${glowB},0.15) 55%,
      rgba(${glowR},${glowG},${glowB},0.55) 70%,
      rgba(${glowR},${glowG},${glowB},0.2) 85%,
      rgba(${glowR},${glowG},${glowB},0.08) 100%
    )
  `;

  const glowCSSVars = {
    '--glow-35': `rgba(${glowR},${glowG},${glowB},0.35)`,
    '--glow-18': `rgba(${glowR},${glowG},${glowB},0.18)`,
    '--glow-08': `rgba(${glowR},${glowG},${glowB},0.08)`,
    '--glow-50': `rgba(${glowR},${glowG},${glowB},0.50)`,
    '--glow-25': `rgba(${glowR},${glowG},${glowB},0.25)`,
  };

  return (
    <>
      <style>{spectralStyles}</style>

      {/* غلاف الطيف الخارجي */}
      <div
        className="spectral-card-wrapper"
        style={{
          background: spectralBorderGradient,
          ...glowCSSVars,
        }}
        onClick={handlePress}
      >
        {/* الكرت الداخلي – يحافظ على كل التنسيق الأصلي */}
        <div
          className="card-inner rounded-2xl overflow-hidden"
          style={{ backgroundColor: level.bgColor }}
        >
          {/* طبقات التأثير */}
          <div className="shimmer-overlay" />
          <div className="shimmer-flash" />
          <div className="ripple-container">
            {ripples.map((r) => (
              <div
                key={r.id}
                className={`ripple-dot${r.isEcho ? ' echo' : ''}`}
                style={{
                  left: r.x,
                  top: r.y,
                  width: r.size,
                  height: r.size,
                  background: `radial-gradient(circle,
                    rgba(${glowR},${glowG},${glowB},0.6) 0%,
                    rgba(${glowR},${glowG},${glowB},0.25) 35%,
                    transparent 70%)`,
                }}
              />
            ))}
          </div>

          {/* ===== رأس البطاقة (التنسيق الأصلي محفوظ) ===== */}
          <div
            className="px-3 py-2.5 flex items-center justify-between"
            style={{ backgroundColor: level.headerBg, height: 35 }}
          >
            <span
              className="font-bold text-white tracking-wide"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '13px',
              }}
            >
              {level.nameEn}
            </span>

            {!level.isUnlocked && (
              <img
                src="/assets/icons/badges/lock.png"
                alt="مقفول"
                width={27.5}
                height={27.5}
                style={{ margin: 0 }}
                className="opacity-80"
              />
            )}
          </div>

          {/* ===== منتصف البطاقة (التنسيق الأصلي محفوظ) ===== */}
          <div className="flex flex-col items-center justify-center px-3 py-3 gap-1.5">
            <img
              className="level-icon-img"
              src={level.iconSrc}
              alt={level.nameAr}
              width={108}
              height={108}
              style={{ objectFit: 'contain' }}
            />

            <span
              className="font-black text-center"
              style={{
                fontFamily: "'Cairo', sans-serif",
                fontSize: '15px',
                color: level.textColor,
              }}
            >
              {level.nameAr}
            </span>
          </div>

          {/* ===== أسفل البطاقة (التنسيق الأصلي محفوظ) ===== */}
          <div
            className="px-3 py-2 space-y-1.5"
            style={{ backgroundColor: level.badgeBg }}
          >
            {/* إحصائية: عدد الاختبارات */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: level.badgeText }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2c0 .7.5 1.2 1.2 1.2h16.8c.7 0 1.2-.5 1.2-1.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <span
                className="font-semibold"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: '11px',
                  color: level.badgeText,
                }}
              >
                {level.quizCount} اختبارات
              </span>
            </div>

            {/* إحصائية: النقاط الممكنة */}
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: level.badgeText }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span
                className="font-semibold"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: '11px',
                  color: level.badgeText,
                }}
              >
                {level.maxPoints} نقطة ممكنة
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LevelCard;