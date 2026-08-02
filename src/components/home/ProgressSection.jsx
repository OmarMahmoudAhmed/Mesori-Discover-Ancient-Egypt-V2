/*
 * =====================================================
 * ProgressSection.jsx - قسم التقدم الكلي
 * =====================================================
 *
 * يعرض هذا المكوّن تقدم المستخدم الإجمالي، بنفس تصميم صورة
 * الموافقة (Home.png) بالضبط:
 *
 * ┌──────────────────────────────────────────┐
 * │        التقدم الإجمالي: 300 نقطة         │   ← نص فوق الشريط، بدون بطاقة/حدود
 * │  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  │   ← شريط بسيط بلونين فقط
 * └──────────────────────────────────────────┘
 *
 * حساب النسبة المئوية:
 * ────────────────────────────────────────────
 * نقاط المستخدم = 300
 * أقصى نقاط ممكنة = 5 مستويات × 100 = 500
 * النسبة = (300 / 500) × 100 = 60%
 *
 * ملاحظة: الشريط يمتلئ دائماً من اليسار لليمين (dir="ltr")
 * بغض النظر عن اتجاه الصفحة RTL، لأن هذا هو المعيار البصري
 * المتعارف عليه لأشرطة التقدم (كما في الصورة المرجعية)
 * =====================================================
 */

import React from 'react';
import { useApp } from '../../context/AppContext';

function ProgressSection() {

  /*
   * نجلب من Context:
   * userProfile.totalPoints = النقاط الحالية للمستخدم
   * progressPercentage      = النسبة المئوية (0-100) محسوبة مسبقاً في Context
   */
  const { userProfile, progressPercentage } = useApp();

  /*
   * لون الشريط يتدرّج مع التقدم (لمسة بسيطة، لا تغيّر شكل التصميم المطابق للصورة)
   * < 40%  → ذهبي
   * < 70%  → أخضر فاتح
   * >= 70% → أخضر داكن (نفس أخضر الصورة المرجعية تقريباً)
   */
  const barColor =
    progressPercentage < 40 ? '#C8922A' :
    progressPercentage < 70 ? '#4CAF50' :
    '#2D8A46';

  return (
    <section className="px-4 mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

      {/* ===== النص أعلى الشريط ===== */}
      <p
        className="text-center font-bold mb-2"
        style={{
          fontFamily: "'Cairo', sans-serif",
          fontSize:   '15px',
          color:      '#3D2B1F',
        }}
      >
        التقدم الإجمالي: {userProfile.totalPoints} نقطة
      </p>

      {/* ===== شريط التقدم (مسار فاتح + جزء ممتلئ ملوّن) ===== */}
      <div
        dir="ltr"
        className="w-full h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(61,43,31,0.15)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width:           `${progressPercentage}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

    </section>
  );
}

export default ProgressSection;
