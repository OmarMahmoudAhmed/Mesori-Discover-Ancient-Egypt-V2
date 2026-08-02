/*
 * =====================================================
 * LeaderboardPage.jsx - قائمة المتصدرين
 * =====================================================
 *
 * تعرض ترتيب جميع اللاعبين حسب النقاط.
 * المستخدم الحالي (isCurrentUser: true) يُبرز بلون أخضر.
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

/*
 * مكوّن صغير لأيقونة الكوب حسب نوعه
 * أيقونات Flaticon Uicons (نمط solid) بدلاً من صور PNG فارغة:
 * ميدالية مذهّبة/فضية/برونزية لكل مركز، بلون وظل (drop-shadow)
 * مناسبين — بنفس أسلوب أيقونات BottomNav.jsx
 */
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
      style={{
        fontSize: '28px',
        color,
        filter: `drop-shadow(0 2px 3px ${color}66)`,
      }}
    />
  );
}

function LeaderboardPage() {

  const { goBack, userProfile, session } = useApp();

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

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
    }

    loadLeaderboard();
  }, [session?.user?.id]);

  return (
    <AppWrapper>
      <Header showBack={true} onBack={goBack} />

      <main
        className="flex-1 overflow-y-auto app-scroll"
        style={{ paddingBottom: '96px' }}
      >

        {/* قسم الرأس */}
        <div className="flex items-end justify-between px-4 pt-2">
          <img
            src={EgyptianLogo}
            alt="شعار ميسوري"
            width={110}
            height={110}
            className="drop-shadow-lg"
          />

          <div className="flex-1 flex flex-col items-center pb-2">
            {/* العنوان بالإنجليزية */}
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: '#C8922A', fontSize: '14px' }}>✦</span>
              <h1
                className="font-black text-2xl"
                style={{ fontFamily: "'Cinzel', serif", color: '#3D2B1F' }}
              >
                Leaderboard
              </h1>
              <span style={{ color: '#C8922A', fontSize: '14px' }}>✦</span>
            </div>

            {/* العنوان بالعربية */}
            <span
              className="font-bold text-base"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#C8922A' }}
            >
              قائمة المتصدرين
            </span>

            {/* الوصف */}
            <p
              className="text-center text-xs mt-2 px-2"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#8B4513', lineHeight: 1.6 }}
            >
              هنا يمكنك الاطلاع على أفضل اللاعبين
              <br />في رحلتهم عبر تاريخ مصر القديمة!
            </p>
          </div>

          <ExplorerCharacter size={80} gender={userProfile.character} />
        </div>


        {/* جدول المتصدرين */}
        <div className="px-4 mt-4">

          {/* رأس الجدول */}
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

          {/* صفوف اللاعبين */}
          {loading ? (
            <p
              className="text-center text-sm py-8"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#8B5A2B' }}
            >
              جاري تحميل الترتيب...
            </p>
          ) : players.length === 0 ? (
            <p
              className="text-center text-sm py-8"
              style={{ fontFamily: "'Cairo', sans-serif", color: '#8B5A2B' }}
            >
              لسه محدش ظهر في الترتيب — كن أول اللاعبين!
            </p>
          ) : (
          <div className="space-y-1.5">
            {players.map((player) => {

              /*
               * isCurrentUser = صحيح للمستخدم الحالي
               * يُغير التمييز البصري للصف
               */
              const isMe = player.isCurrentUser;

              return (
                <div
                  key={player.id}
                  onClick={() => { if (!isMe) setSelectedPlayer(player); }}
                  className="rounded-xl px-3 py-3 flex items-center press-effect no-tap-highlight"
                  style={{
                    backgroundColor: isMe
                      ? '#2D6A3F'           /* أخضر للمستخدم الحالي */
                      : player.rank <= 3
                        ? 'rgba(200,146,42,0.08)'  /* ذهبي خفيف للمراكز الأولى */
                        : 'white',
                    cursor: isMe ? 'default' : 'pointer',
                    border: isMe
                      ? '2px solid #4ADE80'
                      : '1px solid rgba(200,146,42,0.15)',
                    boxShadow: isMe ? '0 0 12px rgba(45,106,63,0.3)' : 'none',
                  }}
                >

                  {/* عمود الترتيب */}
                  <div className="w-1/5 flex justify-center">
                    {player.trophy ? (
                      <TrophyIcon type={player.trophy} />
                    ) : (
                      <span
                        className="font-black text-lg"
                        style={{
                          fontFamily: "'Cairo', sans-serif",
                          color: isMe ? 'white' : '#3D2B1F',
                        }}
                      >
                        {isMe ? player.rank : player.rank}
                      </span>
                    )}
                  </div>

                  {/* عمود اللاعب */}
                  <div className="flex-1 flex items-center gap-2.5">
                    {/*
                      * صورة رمزية دائرية — نفس صور الشخصية المُستخدَمة في باقي التطبيق
                      * (Character1_Pic / Character2_Pic)، لكن مقصوصة على الوجه أعلى
                      * الصورة باستخدام object-fit: cover بدل الجسم الكامل
                      * overflow-hidden على الحاوية الدائرية هو ما يعمل "القص"
                      */}
                    <div
                      className="rounded-full flex-shrink-0 overflow-hidden"
                      style={{
                        border: `2px solid ${isMe ? 'rgba(255,255,255,0.4)' : 'rgba(200,146,42,0.3)'}`,
                      }}
                    >
                      <AvatarDisplay avatarKey={player.avatar} size={40} />
                    </div>

                    <div>
                      <p
                        className="font-bold text-sm"
                        style={{
                          fontFamily: "'Cairo', sans-serif",
                          color: isMe ? 'white' : '#3D2B1F',
                        }}
                      >
                        {player.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{
                          fontFamily: "'Cairo', sans-serif",
                          color: isMe ? 'rgba(255,255,255,0.7)' : '#8B5A2B',
                        }}
                      >
                        Level {player.levelReached}
                      </p>
                    </div>
                  </div>

                  {/* عمود النقاط */}
                  <div className="w-1/5 text-center">
                    <p
                      className="font-black text-base"
                      style={{
                        fontFamily: "'Cairo', sans-serif",
                        color: isMe ? '#FBBF24' : '#C8922A',
                      }}
                    >
                      {player.points}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        fontFamily: "'Cairo', sans-serif",
                        color: isMe ? 'rgba(255,255,255,0.7)' : '#8B5A2B',
                        fontSize: '10px',
                      }}
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
