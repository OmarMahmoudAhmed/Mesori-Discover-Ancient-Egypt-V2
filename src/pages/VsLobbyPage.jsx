/*
 * =====================================================
 * VsLobbyPage.jsx - بوابة نمط 1 ضد 1
 * =====================================================
 * يختار المستخدم بين مباراة عشوائية (طابور مطابقة فوري) أو مباراة
 * ودّية (بحث عن صديق بالاسم وإرسال دعوة).
 * =====================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import AppWrapper from '../components/layout/AppWrapper';
import Header      from '../components/layout/Header';
import BottomNav   from '../components/layout/BottomNav';
import { useApp }  from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';

function VsLobbyPage() {
  const { userProfile, findRandomMatch, cancelMatchmaking, searchUsers, inviteFriendlyMatch, navigateTo } = useApp();

  const [mode, setMode] = useState('menu'); // menu | searching | friendly
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [inviteSentTo, setInviteSentTo] = useState(null);
  const pollRef = useRef(null);

  // بحث عن أصدقاء بالاسم (مع تأخير بسيط عشان ما نضربش الخادم بكل حرف)
  useEffect(() => {
    if (mode !== 'friendly' || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const { users } = await searchUsers(searchQuery.trim());
      setSearchResults(users);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchQuery, mode, searchUsers]);

  const startRandomMatch = async () => {
    setMode('searching');
    const { matchId, error } = await findRandomMatch();
    if (error) { console.error('❌ خطأ في المطابقة:', error); setMode('menu'); return; }
    if (matchId) {
      navigateTo('vs-match', { matchId });
      return;
    }
    // لسه بيدوّر: استمع لأي مباراة جديدة أنا طرف فيها عبر Realtime
    const channel = supabase
      .channel(`matchmaking-${userProfile.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'matches',
        filter: `player_2_id=eq.${userProfile.id}`,
      }, (payload) => {
        supabase.removeChannel(channel);
        navigateTo('vs-match', { matchId: payload.new.id });
      })
      .subscribe();
    pollRef.current = channel;
  };

  const cancelSearch = async () => {
    if (pollRef.current) { supabase.removeChannel(pollRef.current); pollRef.current = null; }
    await cancelMatchmaking();
    setMode('menu');
  };

  useEffect(() => () => { if (pollRef.current) supabase.removeChannel(pollRef.current); }, []);

  const handleInvite = async (opponentId, opponentName) => {
    const { error } = await inviteFriendlyMatch(opponentId);
    if (error) { console.error('❌ خطأ في الدعوة:', error); return; }
    setInviteSentTo(opponentName);
  };

  return (
    <AppWrapper>
      <Header showBack={true} />

      <main className="flex-1 flex flex-col px-6 pb-24" style={{ fontFamily: "'Cairo', sans-serif" }}>

        {mode === 'menu' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
            <div className="text-6xl mb-2">⚔️</div>
            <h1 className="text-xl font-black" style={{ color: '#3D2B1F' }}>1 ضد 1</h1>
            <p className="text-xs mb-2" style={{ color: '#8B5A2B' }}>
              تصنيفك: {userProfile.rating} · {userProfile.vsWins} فوز / {userProfile.vsLosses} خسارة
            </p>

            <button
              onClick={startRandomMatch}
              className="w-full max-w-xs flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white press-effect no-tap-highlight"
              style={{ backgroundColor: '#7A1F1F' }}
            >
              <i className="fi fi-sr-shuffle" aria-hidden="true" style={{ fontSize: '16px' }} />
              <span>مباراة عشوائية</span>
            </button>
            <p className="text-[11px] -mt-2" style={{ color: '#A8A29E' }}>خصم عشوائي، فوز يكسبك نقاط ورصيد إضافي</p>

            <button
              onClick={() => setMode('friendly')}
              className="w-full max-w-xs flex items-center justify-center gap-2 py-4 rounded-2xl font-bold press-effect no-tap-highlight"
              style={{ backgroundColor: 'white', border: '2px solid #C8922A', color: '#C8922A' }}
            >
              <i className="fi fi-rr-user-add" aria-hidden="true" style={{ fontSize: '16px' }} />
              <span>مباراة ودّية مع صديق</span>
            </button>
          </div>
        )}

        {mode === 'searching' && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
            <div className="text-5xl animate-pulse">⚔️</div>
            <p className="font-bold text-sm" style={{ color: '#3D2B1F' }}>بندوّر على خصم...</p>
            <button
              onClick={cancelSearch}
              className="px-6 py-2.5 rounded-xl font-bold text-sm"
              style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
            >
              إلغاء
            </button>
          </div>
        )}

        {mode === 'friendly' && (
          <div className="flex-1 pt-4">
            <button onClick={() => { setMode('menu'); setInviteSentTo(null); }} className="mb-4 text-xs font-bold" style={{ color: '#8B5A2B' }}>
              ← رجوع
            </button>
            <h2 className="font-black text-base mb-3" style={{ color: '#3D2B1F' }}>ابحث عن صديق باسمه</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اكتب اسم المستخدم..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
              style={{ backgroundColor: 'white', border: '1px solid rgba(200,146,42,0.3)', color: '#3D2B1F' }}
            />

            {inviteSentTo && (
              <div className="rounded-xl p-3 mb-3 text-center text-sm font-bold" style={{ backgroundColor: 'rgba(45,106,63,0.1)', color: '#2D6A3F' }}>
                تم إرسال الدعوة لـ {inviteSentTo}! هتوصله إشعار فوراً.
              </div>
            )}

            <div className="space-y-2">
              {searchResults.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'white', border: '1px solid rgba(200,146,42,0.15)' }}>
                  <span className="font-bold text-sm" style={{ color: '#3D2B1F' }}>{u.username}</span>
                  <button
                    onClick={() => handleInvite(u.id, u.username)}
                    className="px-4 py-2 rounded-lg font-bold text-xs text-white"
                    style={{ backgroundColor: '#C8922A' }}
                  >
                    دعوة
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav activePage="home" />
    </AppWrapper>
  );
}

export default VsLobbyPage;
