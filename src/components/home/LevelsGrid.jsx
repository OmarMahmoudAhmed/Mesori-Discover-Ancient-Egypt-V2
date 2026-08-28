/*
 * =====================================================
 * LevelsGrid.jsx - شبكة المستويات الخمسة
 * =====================================================
 * ⬅️ الكروت دلوقتي أصغر ومربّعة (aspect-square) بحجم ثابت واحد
 *   (clamp بين 72px و104px حسب عرض الشاشة) بدل ما تملأ أي مساحة
 *   رأسية متاحة — وبما إن الصفين بيستخدموا نفس المقاس بالظبط،
 *   التساوي بين الكروت الخمسة مضمون تلقائياً بدون أي حساب إضافي.
 * =====================================================
 */

import React from 'react';
import LevelCard  from './LevelCard';
import { useApp } from '../../context/AppContext';

const CARD_SIZE = 'clamp(72px, 26vw, 104px)';

function LevelsGrid() {

  const { levelsData } = useApp();

  const firstRow  = levelsData.slice(0, 3);
  const secondRow = levelsData.slice(3);

  return (
    <section className="px-4 flex-shrink-0 flex flex-col items-center gap-2.5">

      {/* ===== الصف الأول: المستويات 1, 2, 3 ===== */}
      <div className="flex justify-center gap-2.5">
        {firstRow.map((level) => (
          <div key={level.id} className="aspect-square" style={{ width: CARD_SIZE }}>
            <LevelCard level={level} />
          </div>
        ))}
      </div>

      {/* ===== الصف الثاني: المستويات 4, 5 — نفس المقاس بالظبط ===== */}
      <div className="flex justify-center gap-2.5">
        {secondRow.map((level) => (
          <div key={level.id} className="aspect-square" style={{ width: CARD_SIZE }}>
            <LevelCard level={level} />
          </div>
        ))}
      </div>

    </section>
  );
}

export default LevelsGrid;
