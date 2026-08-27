/*
 * =====================================================
 * ProgressSection.jsx - قسم التقدم الكلي
 * =====================================================
 * ⬅️ هوامش وأحجام مخفّضة شوية (mb-4→pb-1، النص 15px→13px، شريط
 *   التقدّم 12px→10px ارتفاع) كجزء من ضغط الصفحة الرئيسية عشان
 *   تتظبط بدون تمرير — main في HomePage.jsx بيحجز مسافة BottomNav
 *   بنفسه أصلاً (paddingBottom)، فمش محتاجة هامش سفلي إضافي هنا.
 *   flex-shrink-0 عشان ياخد حجمه الطبيعي بس ضمن العمود الرأسي
 *   الجديد في HomePage (Hero + Grid + Progress).
 * =====================================================
 */

import React from 'react';
import { useApp } from '../../context/AppContext';

function ProgressSection() {

  const { userProfile, progressPercentage } = useApp();

  const barColor =
    progressPercentage < 40 ? '#C8922A' :
    progressPercentage < 70 ? '#4CAF50' :
    '#2D8A46';

  return (
    <section className="px-4 pt-1 pb-1 flex-shrink-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

      <p
        className="text-center font-bold mb-1.5"
        style={{ fontFamily: "'Cairo', sans-serif", fontSize: '13px', color: '#3D2B1F' }}
      >
        التقدم الإجمالي: {userProfile.totalPoints} نقطة
      </p>

      <div
        dir="ltr"
        className="w-full h-2.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(61,43,31,0.15)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercentage}%`, backgroundColor: barColor }}
        />
      </div>

    </section>
  );
}

export default ProgressSection;
