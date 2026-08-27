/*
 * =====================================================
 * LeaderboardPage.jsx - قائمة المتصدرين
 * =====================================================
 *
 * تعرض ترتيب جميع اللاعبين حسب النقاط.
 * المستخدم الحالي (isCurrentUser: true) يُبرز بلون أخضر.
 *
 * ⬅️ إصلاح صف الرأس (شعار + عنوان + شخصية): كان بلا أي حماية من
 *   الانكماش (flex-shrink-0 / min-w-0)، فعلى شاشة هاتف بعرض عادي
 *   كان إجمالي عرض العناصر الثلاثة (شعار 110 + شخصية 80 + عمود
 *   عنوان بعرضه الأدنى الطبيعي بسبب "Leaderboard" الكبيرة ووصف
 *   سطرين) يتخطى عرض الحاوية الفعلي. ومع overflow-x-hidden على
 *   AppWrapper، الجزء الزايد كان بيتقص بصمت بدل ما يعمل سكرول —
 *   وبما إن الصفحة كلها RTL وشخصية المستكشف هي آخر عنصر DOM (يعني
 *   أقصى يسار الصفحة في RTL)، هي اللي كانت بتتقص وتظهر "خارج
 *   الإطار من ناحية اليسار" بالظبط زي ما وصف عمر، وده نفسه سبب
 *   شكل الصفحة "المايل لليسار" (وزن العناصر الظاهرة بيبقى متجمّع
 *   ناحية اليمين). الحل: flex-shrink-0 على الشعار والشخصية (يمنعهم
 *   من التصارع على المساحة)، min-w-0 على عمود العنوان الأوسط (يسمح
 *   لنصّه ينكمش/يلف بدل ما يفرض عرض أدنى كبير)، وتصغير الحجمين
 *   الأساسيين (110→82 / 80→62) + عنوان أصغر (text-2xl→text-xl)
 *   كهامش أمان إضافي على الشاشات الأضيق.
 *
 * ⬅️ إضافة: شارة صغيرة متحركة (RankChangeBadge) بجانب ترتيب
 *   المستخدم الحالي، تقارن ترتيبه/نقاطه الحاليين بآخر زيارة محفوظة
 *   محلياً (rankTracking.js) — أخضر لو تحسّن، أحمر لو حد تخطاه.
 *   لو "تخطاه حد فعلاً" (rankDelta < 0)، تُطلق أيضاً إشعار محلي
 *   عبر Capacitor (notifications.js) — تمهيد لإشعارات أندرويد
 *   (راجع التعليقات في الملفين للحدود المتعمّدة لهذا النظام).
 * =====================================================
 */

import React, { useState, useEffect } from 'react';
import AppWrapper        from '../components/layout/AppWrapper';
import Header            from '../components/layout/Header';
import BottomNav         from '../components/layout/BottomNav';
import EgyptianLogo      from '../components/shared/EgyptianLogo.png';
import ExplorerCharacter from '../components/shared/ExplorerCharacter';
import { useApp }        from '../context/AppContext';
import { supabase }      from '../lib/supabaseClient';
import { AvatarDisplay } from '../data/avatars';
import PlayerProfileModal from '../components/leaderboard/PlayerProfileModal';
import RankChangeBadge   from '../components/leaderboard/RankChangeBadge';
import { getLastSeenRank, saveLastSeenRank, computeRankChange } from '../lib/rankTracking';
import { notifyRankOvertaken } from '../lib/notifications';

const TROPHY_STYLES = {
  gold:   { iconClass: 'fi-sr-first-medal',  color: '#F5B700', label: 'المركز الأول'  },
  silver: { iconClass: 'fi-sr-second-medal', color: '#A8A8B3', label: 'المركز الثاني' },
  bronze: { iconClass: 'fi-sr-third-medal',  color: '#CD7F32', label: 'المركز الثالث' },
};

function TrophyIcon({ type }) {
  if (!type || !TROPHY_STYLES[type]) return null;
  const { iconClass, color, label } = TROPHY_STYLES[type];

  return (
    <i
      className={`fi ${iconClass}`}
      role="img"
      aria-label={label}
      style={{ fontSize: '28px', color, filter: `drop-shadow(0 2px 3px ${color}66)` }}
    />
  );
}

function LeaderboardPage() {

  const { goBack, userProfile, session } = useApp();

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [rankChange, setRankChange] = useState(null);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('rank');

      if (error) {
        console.error('❌ خطأ في تحميل قائمة المتصدرين:', error);
        setPlayers([]);
        setLoading(false);
        return;
      }

      const TROPHY_BY_RANK = { 1: 'gold', 2: 'silver', 3: 'bronze' };
      setPlayers((data || []).map(row => ({
        id: row.id,
        rank: row.rank,
        trophy: TROPHY_BY_RANK[row.rank] || null,
        avatar: row.character,
        gender: row.gender,
        name: row.username,
        levelReached: row.level_reached,
        points: row.total_points,
        isCurrentUser: row.id === session?.user?.id,
      })));
      setLoading(false);

      /*
       * تتبّع تغيّر الترتيب/النقاط منذ آخر زيارة لهذه الصفحة —
       * راجع rankTracking.js لتفاصيل الحدود المتعمّدة لهذا النظام
       */
      const mine = (data || []).find(row => row.id === session?.user?.id);
      if (mine) {
        const previous = getLastSeenRank(session.user.id);
        const change = computeRankChange(previous, { rank: mine.rank, points: mine.total_points });
        if (change) {
          setRankChange(change);
          if (change.overtaken) {
            notifyRankOvertaken({ newRank: mine.rank, previousRank: previous.rank });
          }
        }
        saveLastSeenRank(session.user.id, { rank: mine.rank, points: mine.total_points });
      }
    }

    loadLeaderboard();
  }, [session?.user?.id]);

  return (
    <AppWrapper>
      <Header showBack={true} onBack={goBack} />

      <main
        className="flex-1 overflow-y-auto app-scroll"
        style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}
      >

        {/* قسم الرأس — flex-shrink-0 على الطرفين، min-w-0 على المنتصف */}
        <div className="flex items-end justify-between px-4 pt-2 gap-2">
          <img
            src={EgyptianLogo}
            alt="شعار ميسوري"
            width={82}
            height={82}
            className="drop-shadow-lg flex-shrink-0"
          />

          <div className="flex-1 min-w-0 flex flex-col items-center pb-2">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: '#C8922A', fontSize: '14px' }}>✦</span>
              <h1
                className="font-black text-xl truncate"
                style={{ fontFamily: "'Cinzel', serif", color: '#3D2B1F' }}
              >
                Leaderboard
              </h1>
              <span style={{ color: '#C8922A', fontSize: '14px' }}>✦</span>
            </div>

            <span
              className="font-bold text-base"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#805D1B' }}
            >
              قائمة المتصدرين
            </span>

            <p
              className="text-center text-xs mt-2 px-1"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#8B4513', lineHeight: 1.6 }}
            >
              هنا يمكنك الاطلاع على أفضل اللاعبين
              <br />في رحلتهم عبر تاريخ مصر القديمة!
            </p>
          </div>

          <div className="flex-shrink-0">
            <ExplorerCharacter size={62} gender={userProfile.character} />
          </div>
        </div>


        {/* جدول المتصدرين */}
        <div className="px-4 mt-4">

          <div
            className="grid grid-cols-3 px-4 py-2 rounded-t-xl mb-1"
            style={{ backgroundColor: '#3D2B1F' }}
          >
            {['الترتيب', 'اللاعب', 'النقاط'].map((header) => (
              <span
                key={header}
                className="text-center text-xs font-bold text-white"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {header}
              </span>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-sm py-8" style={{ fontFamily: "'Cairo', sans-serif", color: '#8B5A2B' }}>
              جاري تحميل الترتيب...
            </p>
          ) : players.length === 0 ? (
            <p className="text-center text-sm py-8" style={{ fontFamily: "'Cairo', sans-serif", color: '#8B5A2B' }}>
              لسه محدش ظهر في الترتيب — كن أول اللاعبين!
            </p>
          ) : (
          <div className="space-y-1.5">
            {players.map((player) => {

              const isMe = player.isCurrentUser;

              return (
                <div
                  key={player.id}
                  onClick={() => { if (!isMe) setSelectedPlayer(player); }}
                  className="rounded-xl px-3 py-3 flex items-center press-effect no-tap-highlight"
                  style={{
                    backgroundColor: isMe
                      ? '#2D6A3F'
                      : player.rank <= 3
                        ? 'rgba(200,146,42,0.08)'
                        : 'white',
                    cursor: isMe ? 'default' : 'pointer',
                    border: isMe ? '2px solid #4ADE80' : '1px solid rgba(200,146,42,0.15)',
                    boxShadow: isMe ? '0 0 12px rgba(45,106,63,0.3)' : 'none',
                  }}
                >

                  {/* عمود الترتيب — relative عشان يستضيف شارة التغيّر */}
                  <div className="w-1/5 flex justify-center relative">
                    {player.trophy ? (
                      <TrophyIcon type={player.trophy} />
                    ) : (
                      <span
                        className="font-black text-lg"
                        style={{ fontFamily: "'Cairo', sans-serif", color: isMe ? 'white' : '#3D2B1F' }}
                      >
                        {player.rank}
                      </span>
                    )}
                    {isMe && <RankChangeBadge rankDelta={rankChange?.rankDelta} />}
                  </div>

                  {/* عمود اللاعب */}
                  <div className="flex-1 flex items-center gap-2.5">
                    <div
                      className="rounded-full flex-shrink-0 overflow-hidden"
                      style={{ border: `2px solid ${isMe ? 'rgba(255,255,255,0.4)' : 'rgba(200,146,42,0.3)'}` }}
                    >
                      <AvatarDisplay avatarKey={player.avatar} size={40} />
                    </div>

                    <div>
                      <p
                        className="font-bold text-sm"
                        style={{ fontFamily: "'Cairo', sans-serif", color: isMe ? 'white' : '#3D2B1F' }}
                      >
                        {player.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ fontFamily: "'Cairo', sans-serif", color: isMe ? 'rgba(255,255,255,0.7)' : '#8B5A2B' }}
                      >
                        Level {player.levelReached}
                      </p>
                    </div>
                  </div>

                  {/* عمود النقاط */}
                  <div className="w-1/5 text-center">
                    <p
                      className="font-black text-base"
                      style={{ fontFamily: "'Cairo', sans-serif", color: isMe ? '#FBBF24' : '#C8922A' }}
                    >
                      {player.points}
                    </p>
                    <p
                      className="text-xs"
                      style={{ fontFamily: "'Cairo', sans-serif", color: isMe ? 'rgba(255,255,255,0.7)' : '#8B5A2B', fontSize: '10px' }}
                    >
                      نقطة
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
          )}
        </div>
      </main>

      <BottomNav activePage="leaderboard" />

      {selectedPlayer && (
        <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </AppWrapper>
  );
}

export default LeaderboardPage;
