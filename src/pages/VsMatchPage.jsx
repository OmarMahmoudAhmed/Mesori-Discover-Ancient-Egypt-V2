/*
 * =====================================================
 * VsMatchPage.jsx - شاشة اللعب الفعلي لمباراة 1 ضد 1
 * =====================================================
 * مُصمّمة للعب المزامن الفوري (Real-time Synchronized):
 * - Timer مُرسَل من السيرفر (question_started_at + question_time_limit_seconds)
 * - الانتقال التلقائي للسؤال التالي (advance_match_round عند إجابة اللاعبين)
 * - لا يوجد عدّاد محلي: السيرفر هو مصدر الحقيقة الوحيد
 *
 * حالات الصفحة:
 * 1) 'invite'   → دعوة ودّية لسه منتظرة قبولك
 * 2) 'loading'  → جاري تحميل حالة المباراة
 * 3) 'question' → سؤال حالي معروض مع عدّ تنازلي من السيرفر
 * 4) 'waiting'  → اللاعب خلّص الأسئلة، مستني الخصم يخلّص
 * 5) 'result'   → المباراة خلصت، عرض النتيجة
 * =====================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import AppWrapper from '../components/layout/AppWrapper';
import Header      from '../components/layout/Header';
import { useApp }  from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { AvatarDisplay } from '../data/avatars';

function VsMatchPage() {
  const { pageData, userProfile, navigateTo, getCurrentMatchState, submitMatchAnswer, submitBotAnswer, acceptFriendlyMatch, declineFriendlyMatch } = useApp();
  const matchId = pageData?.matchId;

  const [phase, setPhase] = useState('loading');
  const [matchState, setMatchState] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const channelRef = useRef(null);
  const timerRef = useRef(null);
  const hasSubmittedRef = useRef(false);

  const isPlayer1 = matchState?.player_1_id === userProfile.id;
  const opponentId = matchState ? (isPlayer1 ? matchState.player_2_id : matchState.player_1_id) : null;

  // جلب حالة المباراة من السيرفر
  const fetchState = useCallback(async () => {
    if (!matchId) return;
    const { state, error } = await getCurrentMatchState(matchId);
    if (error || !state) { navigateTo('vs-lobby'); return; }
    setMatchState(state);

    if (state.status === 'finished' || state.status === 'declined' || state.status === 'abandoned') {
      setPhase('result');
    } else if (state.status === 'pending' && state.player_2_id === userProfile.id) {
      setPhase('invite');
    } else if (state.my_answered) {
      setPhase('waiting');
    } else {
      setPhase('question');
    }
    return state;
  }, [matchId, getCurrentMatchState, navigateTo, userProfile.id]);

  // تحميل أولي
  useEffect(() => { fetchState(); }, [fetchState]);

  // العدّ التنازلي المُرسَل من السيرفر
  useEffect(() => {
    if (phase !== 'question' || !matchState?.question_started_at || !matchState?.question_time_limit_seconds) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }

    const deadline = new Date(matchState.question_started_at).getTime() + (matchState.question_time_limit_seconds * 1000);

    function tick() {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0 && !hasSubmittedRef.current) {
        // انتهى الوقت: قدّم أي إجابة مختارة (أو فاضية)
        handleSubmit(true);
      }
    }

    tick();
    timerRef.current = setInterval(tick, 200);
    return () => { clearInterval(timerRef.current); timerRef.current = null; };
  }, [phase, matchState?.question_started_at, matchState?.question_time_limit_seconds]);

  // استماع Realtime: أي تغيير في المباراة (سؤال جديد أو انتهاء)
  useEffect(() => {
    if (!matchId || !opponentId) return;

    const channel = supabase
      .channel(`match-${matchId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}`,
      }, async (payload) => {
        const updated = payload.new;
        if (updated.status === 'finished' || updated.status === 'declined' || updated.status === 'abandoned') {
          // المباراة خلصت: اجلب النتيجة النهائية
          const { state: finalState } = await getCurrentMatchState(matchId);
          if (finalState) setMatchState(finalState);
          setPhase('result');
          return;
        }
        // سؤال جديد: اجلب الحالة الكاملة
        const newState = await fetchState();
        if (newState) {
          hasSubmittedRef.current = false;
          setSelectedIndex(null);
          setLastAnswerCorrect(null);
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => supabase.removeChannel(channel);
  }, [matchId, opponentId, getCurrentMatchState, fetchState]);

  // محاكاة إجابة البوت — فقط لو المباراة ضد بوت. مفيش عميل تاني يمثّله،
  // فعميل اللاعب نفسه هو اللي بيحدد "امتى" البوت يجاوب (تأخير عشوائي
  // يحاكي وقت تفكير إنسان)، لكن الصح/الغلط بيتحسم في السيرفر
  // (submit_bot_answer) مش هنا — عشان يفضل نفس مصدر الحقيقة الوحيد.
  useEffect(() => {
    if (!matchState?.is_bot_match || phase !== 'question') return;
    if (matchState.opponent_answered) return;

    const deadline = matchState.question_started_at
      ? new Date(matchState.question_started_at).getTime() + matchState.question_time_limit_seconds * 1000
      : Date.now() + matchState.question_time_limit_seconds * 1000;
    const remainingMs = Math.max(1000, deadline - Date.now());

    // بين 1.5 ثانية و(الوقت المتبقي - نص ثانية أمان)، عشان يحس طبيعي
    // ومايجاوبش بالظبط في نفس اللحظة كل مرة
    const minDelay = 1500;
    const maxDelay = Math.max(minDelay + 400, remainingMs - 500);
    const delay = minDelay + Math.random() * (maxDelay - minDelay);

    const timer = setTimeout(() => {
      submitBotAnswer(matchId, matchState.current_question_index);
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchState?.is_bot_match, matchState?.current_question_index, matchState?.opponent_answered, phase, matchId]);

  // إرسال الإجابة
  const handleSubmit = useCallback(async (isTimeout = false) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const idx = selectedIndex ?? 0;
    const { isCorrect } = await submitMatchAnswer(matchId, matchState.current_question_index, idx);
    setLastAnswerCorrect(isCorrect);

    // بعد الإجابة: انتظار Realtime event للسؤال التالي أو النتيجة
    setPhase('waiting');
  }, [matchId, matchState?.current_question_index, selectedIndex, submitMatchAnswer]);

  const handleAccept = async () => {
    const { error } = await acceptFriendlyMatch(matchId);
    if (error) { console.error('❌', error); navigateTo('vs-lobby'); return; }
    await fetchState();
  };

  const handleDecline = async () => {
    await declineFriendlyMatch(matchId);
    navigateTo('vs-lobby');
  };

  // =========== واجهات الحالات المختلفة ===========

  if (phase === 'loading' || !matchState) {
    return (
      <AppWrapper>
        <Header showBack={true} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-4xl animate-pulse">⚔️</div>
        </main>
      </AppWrapper>
    );
  }

  if (phase === 'invite') {
    return (
      <AppWrapper>
        <Header showBack={true} />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
          <div className="text-5xl">⚔️</div>
          <p className="font-black text-lg" style={{ color: '#3D2B1F' }}>دعوة لمباراة ودّية!</p>
          <div className="flex gap-3 w-full max-w-xs mt-2">
            <button onClick={handleDecline} className="flex-1 py-3 rounded-xl font-bold" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
              رفض
            </button>
            <button onClick={handleAccept} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ backgroundColor: '#2D6A3F' }}>
              قبول والبدء
            </button>
          </div>
        </main>
      </AppWrapper>
    );
  }

  if (phase === 'waiting') {
    return (
      <AppWrapper>
        <Header showBack={true} />
        <main className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
          <div className="text-4xl animate-pulse">⏳</div>
          <p className="font-bold text-sm" style={{ color: '#3D2B1F' }}>خلّصت أسئلتك! مستني خصمك يخلّص...</p>
          {matchState.opponent_username && (
            <div className="flex items-center gap-2.5 mt-2 px-4 py-2.5 rounded-2xl" style={{ backgroundColor: 'white', border: '1px solid rgba(200,146,42,0.2)' }}>
              <AvatarDisplay avatarKey={matchState.opponent_character} size={36} />
              <div className="text-right">
                <p className="text-xs font-bold" style={{ color: '#3D2B1F' }}>{matchState.opponent_username}</p>
                <p className="text-[10px]" style={{ color: '#8B5A2B' }}>
                  {matchState.opponent_correct_count} / {matchState.total_questions} صح
                  {matchState.opponent_answered && (matchState.opponent_correct ? ' · جاوب ✅' : ' · جاوب ❌')}
                </p>
              </div>
            </div>
          )}
        </main>
      </AppWrapper>
    );
  }

  if (phase === 'result') {
    const won = matchState.winner_id === userProfile.id;
    const isDraw = !matchState.winner_id && matchState.status === 'finished';
    const myChange = isPlayer1 ? matchState.player_1_rating_change : matchState.player_2_rating_change;

    return (
      <AppWrapper>
        <Header showBack={true} />
        <main className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
          <div className="text-6xl">{matchState.status === 'declined' ? '😕' : won ? '🏆' : isDraw ? '🤝' : '😔'}</div>
          <p className="font-black text-xl" style={{ color: '#3D2B1F' }}>
            {matchState.status === 'declined' ? 'الدعوة اتّرفضت' : won ? 'فزت!' : isDraw ? 'تعادل' : 'خسرت'}
          </p>
          {myChange != null && (
            <p className="text-sm font-bold" style={{ color: myChange >= 0 ? '#2D6A3F' : '#DC2626' }}>
              التصنيف: {myChange >= 0 ? '+' : ''}{myChange}
            </p>
          )}
          <button
            onClick={() => navigateTo('vs-lobby')}
            className="mt-4 px-6 py-3 rounded-xl font-bold text-white"
            style={{ backgroundColor: '#C8922A' }}
          >
            العودة للبوابة
          </button>
        </main>
      </AppWrapper>
    );
  }

  // phase === 'question' — السؤال الحالي مع العدّ التنازلي
  const timerPct = matchState.question_time_limit_seconds > 0
    ? (timeLeft / matchState.question_time_limit_seconds) * 100
    : 0;
  const timerColor = timeLeft <= 5 ? '#DC2626' : timeLeft <= 10 ? '#F59E0B' : '#2D6A3F';

  return (
    <AppWrapper>
      <Header showBack={true} />
      <main className="flex-1 flex flex-col px-5 pb-8" style={{ fontFamily: "'Cairo', sans-serif" }}>

        {/* شريط المعلومات: السؤال + العدّ التنازلي */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold" style={{ color: '#8B5A2B' }}>
            سؤال {(matchState.current_question_index ?? 0) + 1} / {matchState.total_questions}
          </span>
          <span className="text-sm font-black" style={{ color: timerColor, fontVariantNumeric: 'tabular-nums' }}>
            {timeLeft}s
          </span>
        </div>

        {/* شريط التقدم الملوّن */}
        <div className="w-full h-1.5 rounded-full mb-4" style={{ backgroundColor: 'rgba(200,146,42,0.15)' }}>
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
          />
        </div>

        {/* هوية الخصم + نتيجته الحية — بتشتغل بنفس الشكل للبوت والإنسان،
            لأن الاتنين صفوف profiles حقيقية من نفس الشكل بالظبط */}
        {matchState.opponent_username && (
          <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(200,146,42,0.06)' }}>
            <div className="flex items-center gap-2">
              <AvatarDisplay avatarKey={matchState.opponent_character} size={30} />
              <div className="text-right">
                <p className="text-[11px] font-bold leading-tight" style={{ color: '#3D2B1F' }}>{matchState.opponent_username}</p>
                <p className="text-[9px] leading-tight" style={{ color: '#8B5A2B' }}>تصنيف {matchState.opponent_rating}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black" style={{ color: '#2D6A3F', fontVariantNumeric: 'tabular-nums' }}>
                {matchState.opponent_correct_count}/{matchState.total_questions}
              </span>
              {matchState.opponent_answered && (
                <span className="text-sm">{matchState.opponent_correct ? '✅' : '❌'}</span>
              )}
            </div>
          </div>
        )}

        {matchState.question && (
          <>
            <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: 'white', border: '1px solid rgba(200,146,42,0.2)' }}>
              <p className="font-bold text-sm leading-relaxed" style={{ color: '#3D2B1F' }}>{matchState.question}</p>
            </div>

            <div className="space-y-2.5">
              {matchState.options.map((opt, idx) => {
                const isSelected = selectedIndex === idx;
                const showFeedback = lastAnswerCorrect !== null;
                const isRight = showFeedback && lastAnswerCorrect && isSelected;
                const isWrong = showFeedback && !lastAnswerCorrect && isSelected;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (hasSubmittedRef.current) return;
                      setSelectedIndex(idx);
                    }}
                    disabled={hasSubmittedRef.current}
                    className="w-full text-right px-4 py-3.5 rounded-xl font-semibold text-sm press-effect no-tap-highlight"
                    style={{
                      backgroundColor: isRight ? 'rgba(45,106,63,0.15)' : isWrong ? 'rgba(220,38,38,0.1)' : isSelected ? 'rgba(200,146,42,0.08)' : 'white',
                      border: `2px solid ${isRight ? '#2D6A3F' : isWrong ? '#DC2626' : isSelected ? '#C8922A' : 'rgba(200,146,42,0.2)'}`,
                      color: '#3D2B1F',
                      opacity: hasSubmittedRef.current ? 0.6 : 1,
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedIndex !== null && !hasSubmittedRef.current && (
              <button
                onClick={() => handleSubmit(false)}
                className="w-full mt-6 py-3.5 rounded-2xl font-bold text-white"
                style={{ backgroundColor: '#C8922A' }}
              >
                تأكيد الإجابة
              </button>
            )}
          </>
        )}
      </main>
    </AppWrapper>
  );
}

export default VsMatchPage;
