/*
 * =====================================================
 * LevelsGrid.jsx - شبكة المستويات الخمسة
 * =====================================================
 * ⬅️ الصفّان (3 ثم 2) موجودان زي الأصل، لكن دلوقتي كل الكروت
 *   الخمسة بنفس المقاس بالظبط: الصف الأول grid-cols-3 عادي، لكن
 *   الصف الثاني بقى صف flex بعرض بطاقة محسوب بنفس معادلة عمود
 *   الشبكة في الصف الأول calc((100% - gap) / 3)، بدل grid-cols-2
 *   القديم اللي كان بيمدّد الكرتين ليصيروا أعرض من كروت الصف
 *   الأول (كان ده متعمّد أصلاً في الكود القديم "لتمييز المستويات
 *   الأصعب" — لكن عمر بيفضّل شكل موحّد ومنظّم دلوقتي). النتيجة:
 *   نفس ترتيب "3 فوق، 2 تحت متمركزة" لكن بمقاس واحد لكل الكروت.
 * ⬅️ القسم كله flex-1 min-h-0 عشان ياخد بالظبط المساحة المتبقية
 *   بعد HeroSection وProgressSection (بدل ارتفاع حر بيكبر بحجم
 *   محتواه) — وده اللي بيخلي الصفحة الرئيسية كلها تتظبط في ارتفاع
 *   الشاشة من غير تمرير.
 * =====================================================
 */

import React from 'react';
import LevelCard  from './LevelCard';
import { useApp } from '../../context/AppContext';

function LevelsGrid() {

  const { levelsData } = useApp();

  const firstRow  = levelsData.slice(0, 3);
  const secondRow = levelsData.slice(3);

  return (
    <section className="px-4 flex-1 min-h-0 flex flex-col gap-2">

      {/* ===== الصف الأول: المستويات 1, 2, 3 ===== */}
      <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
        {firstRow.map((level) => (
          <LevelCard key={level.id} level={level} />
        ))}
      </div>

      {/* ===== الصف الثاني: المستويات 4, 5 — نفس عرض كروت الصف الأول، متمركزة ===== */}
      <div className="flex justify-center gap-2 flex-1 min-h-0">
        {secondRow.map((level) => (
          <div key={level.id} className="h-full" style={{ width: 'calc((100% - 1rem) / 3)' }}>
            <LevelCard level={level} />
          </div>
        ))}
      </div>

    </section>
  );
}

export default LevelsGrid;
