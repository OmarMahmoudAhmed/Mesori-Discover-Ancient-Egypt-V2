/*
 * =====================================================
 * LevelsGrid.jsx - شبكة المستويات الخمسة
 * =====================================================
 *
 * يعرض هذا المكوّن المستويات الخمسة في تنسيق شبكي:
 *
 * ┌─────────┬─────────┬─────────┐
 * │ Level 1 │ Level 2 │ Level 3 │   ← صف 3 عناصر
 * └─────────┴─────────┴─────────┘
 * ┌──────────────┬──────────────┐
 * │   Level 4    │   Level 5    │   ← صف 2 عناصر (أعرض)
 * └──────────────┴──────────────┘
 *
 * لماذا هذا التنسيم؟
 * - 3 بطاقات في الصف الأول تتناسب مع عرض الموبايل
 * - 2 بطاقات في الصف الثاني تكون أعرض قليلاً
 *   مما يميزها بصرياً كمستويات أصعب وأهم
 * =====================================================
 */

import React from 'react';
import LevelCard  from './LevelCard';
import { useApp } from '../../context/AppContext';

function LevelsGrid() {

  const { levelsData } = useApp();

  /*
   * نقسم المستويات إلى صفّين:
   *
   * firstRow  = المستويات 1, 2, 3 (أول 3 عناصر من المصفوفة)
   * secondRow = المستويات 4, 5   (آخر عنصرين)
   *
   * slice(0, 3) = أخذ العناصر من index 0 إلى 2 (3 عناصر)
   * slice(3)    = أخذ كل العناصر من index 3 للنهاية
   */
  const firstRow  = levelsData.slice(0, 3);
  const secondRow = levelsData.slice(3);

  return (
    /*
     * الغلاف الخارجي للقسم
     * px-4: مسافة أفقية من حواف الشاشة
     * mb-4: مسافة سفلية قبل قسم التقدم
     */
    <section className="px-4 mb-6">

      {/* ===== الصف الأول: المستويات 1, 2, 3 ===== */}
      {/*
        * grid-cols-3 = تقسيم المساحة لـ 3 أعمدة متساوية
        * gap-2.5    = مسافة 10px بين البطاقات
        */}
      <div className="grid grid-cols-3 gap-2.5 mb-2.5">
        {firstRow.map((level) => (
          /*
           * key={level.id}: مطلوب من React لتتبع العناصر في القائمة
           * يجب أن يكون فريداً بين الأخوة (siblings)
           */
          <LevelCard
            key={level.id}
            level={level}
          />
        ))}
      </div>

      {/* ===== الصف الثاني: المستويات 4, 5 ===== */}
      {/*
        * grid-cols-2 = عمودان فقط، فتكون البطاقات أعرض
        * هذا يعطي تمييزاً بصرياً للمستويات الأصعب
        */}
      <div className="grid grid-cols-2 gap-2.5">
        {secondRow.map((level) => (
          <LevelCard
            key={level.id}
            level={level}
          />
        ))}
      </div>

    </section>
  );
}

export default LevelsGrid;
