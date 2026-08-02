/*
 * =====================================================
 * VsMatchPage.jsx - شاشة اللعب الفعلي لمباراة 1 ضد 1
 * =====================================================
 * حالات الصفحة:
 * 1) 'invite'   → دعوة ودّية لسه منتظرة قبولك (اضغط قبول/رفض)
 * 2) 'loading'  → جاري تجهيز السؤال
 * 3) 'question' → سؤال حالي معروض، في انتظار إجابتك
 * 4) 'waiting'  → خلّصت كل الأسئلة، مستني الخصم يخلّص هو كمان
 * 5) 'result'   → المباراة خلصت، عرض النتيجة
 * =====================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import AppWrapper from '../components/layout/AppWrapper';
import Header      from '../components/layout/Header';
import { useApp }  from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';

const TOTAL_QUESTIONS = 5;

function VsMatchPage() {
  const { pageData, userProfile, navigateTo, getMatchDetails, getMatchQuestion, submitMatchAnswer, acceptFriendlyMatch, declineFriendlyMatch } = useApp();
  const matchId = pageData?.matchId;

  const [phase, setPhase] = useState('loading');
  const [match, setMatch] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [opponentAnswered, setOpponentAnswered] = useState(0);
  const channelRef = useRef(null);

  const isPlayer1 = match?.player_1_id === userProfile.id;
  const opponentId = match ? (isPlayer1 ? match.player_2_id : match.player_1_id) : null;

  // تحميل تفاصيل المباراة أول مرة
  useEffect(() => {
    if (!matchId) return;
    async function load() {
      const { match: m, error } = await getMatchDetails(matchId);
      if (error || !m) { navigateTo('vs-lobby'); return; }
      setMatch(m);
      if (m.mode === 'friendly' && m.status === 'pending' && m.player_2_id === userProfile.id) {
        setPhase('invite');
      } else if (m.status === 'finished' || m.status === 'declined' || m.status === 'abandoned') {
        setPhase('result');
      } else {
        setPhase('question');
      }
    }
    load();
  }, [matchId]);

  // تحميل السؤال الحالي
  useEffect(() => {
    if (phase !== 'question') return;
    async function loadQ() {
      const { question } = await getMatchQuestion(matchId, questionIndex);
      setCurrentQuestion(question);
      setSelectedIndex(null);
      setLastAnswerCorrect(null);
    }
    loadQ();
  }, [phase, questionIndex, matchId]);

  // استماع فوري لتقدّم الخصم ولحظة انتهاء المباراة
  useEffect(() => {
    if (!match) return;

    const channel = supabase
      .channel(`match-${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'match_answers', filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        if (payload.new.player_id === opponentId) {
          setOpponentAnswered(prev => prev + 1);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}`,
      }, (payload) => {
        if (payload.new.status === 'finished') {
          setMatch(payload.new);
          setPhase('result');
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => supabase.removeChannel(channel);
  }, [match?.id, opponentId]);

  const handleAccept = async () => {
    const { error } = await acceptFriendlyMatch(matchId);
    if (error) { console.error('❌', error); navigateTo('vs-lobby'); return; }
    setPhase('question');
  };

  const handleDecline = async () => {
    await declineFriendlyMatch(matchId);
    navigateTo('vs-lobby');
  };

  const handleSelectAnswer = async (idx) => {
    if (selectedIndex !== null) return; // منع الضغط المزدوج
    setSelectedIndex(idx);
    const { isCorrect } = await submitMatchAnswer(matchId, questionIndex, idx);
    setLastAnswerCorrect(isCorrect);
  };

  const handleNext = () => {
    if (questionIndex + 1 < TOTAL_QUESTIONS) {
      setQuestionIndex(prev => prev + 1);
      setPhase('question');
    } else {
      setPhase('waiting'); // خلّصت، مستني الخصم أو تحديث الحالة الفوري
    }
  };

  if (phase === 'loading' || !match) {
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
          <p className="text-xs" style={{ color: '#8B5A2B' }}>خصمك جاوب {opponentAnswered} من {TOTAL_QUESTIONS}</p>
        </main>
      </AppWrapper>
    );
  }

  if (phase === 'result') {
    const won = match.winner_id === userProfile.id;
    const isDraw = !match.winner_id && match.status === 'finished';
    const myChange = isPlayer1 ? match.player_1_rating_change : match.player_2_rating_change;

    return (
      <AppWrapper>
        <Header showBack={true} />
        <main className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
          <div className="text-6xl">{match.status === 'declined' ? '😕' : won ? '🏆' : isDraw ? '🤝' : '😔'}</div>
          <p className="font-black text-xl" style={{ color: '#3D2B1F' }}>
            {match.status === 'declined' ? 'الدعوة اتّرفضت' : won ? 'فزت!' : isDraw ? 'تعادل' : 'خسرت'}
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

  // phase === 'question'
  return (
    <AppWrapper>
      <Header showBack={true} />
      <main className="flex-1 flex flex-col px-5 pb-8" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold" style={{ color: '#8B5A2B' }}>سؤال {questionIndex + 1} / {TOTAL_QUESTIONS}</span>
          <span className="text-xs font-bold" style={{ color: '#8B5A2B' }}>خصمك: {opponentAnswered}/{TOTAL_QUESTIONS}</span>
        </div>

        {currentQuestion && (
          <>
            <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: 'white', border: '1px solid rgba(200,146,42,0.2)' }}>
              <p className="font-bold text-sm leading-relaxed" style={{ color: '#3D2B1F' }}>{currentQuestion.question}</p>
            </div>

            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedIndex === idx;
                const showFeedback = selectedIndex !== null;
                const isRight = showFeedback && lastAnswerCorrect && isSelected;
                const isWrong = showFeedback && !lastAnswerCorrect && isSelected;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    disabled={selectedIndex !== null}
                    className="w-full text-right px-4 py-3.5 rounded-xl font-semibold text-sm press-effect no-tap-highlight"
                    style={{
                      backgroundColor: isRight ? 'rgba(45,106,63,0.15)' : isWrong ? 'rgba(220,38,38,0.1)' : 'white',
                      border: `2px solid ${isRight ? '#2D6A3F' : isWrong ? '#DC2626' : 'rgba(200,146,42,0.2)'}`,
                      color: '#3D2B1F',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedIndex !== null && (
              <button
                onClick={handleNext}
                className="w-full mt-6 py-3.5 rounded-2xl font-bold text-white"
                style={{ backgroundColor: '#C8922A' }}
              >
                {questionIndex + 1 < TOTAL_QUESTIONS ? 'السؤال التالي' : 'إنهاء'}
              </button>
            )}
          </>
        )}
      </main>
    </AppWrapper>
  );
}

export default VsMatchPage;
