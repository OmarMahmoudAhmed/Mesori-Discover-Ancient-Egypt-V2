import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '../context/AppContext';
import QuizPage from '../pages/QuizPage';

/*
 * =====================================================
 * اختبار: هل زر "المرحلة التالية" فعلاً بينقل لأسئلة جديدة؟
 * =====================================================
 * ده بالظبط الباگ اللي اتبلّغ عنه: QuizPage نفس الـ instance
 * فاضل شغّال لما تنتقل بزرار "المرحلة التالية" (بعكس الرجوع
 * لقائمة المراحل اللي بتعمل remount كامل بيصفّر كل حاجة تلقائي).
 * فلو ما اتصفّرش isFinished/currentQuestionIndex... يدوياً،
 * هتفضل شاشة نتيجة المرحلة القديمة ظاهرة فوق أسئلة المرحلة
 * الجديدة اللي اتحمّلت فعلاً في الخلفية.
 *
 * الاختبار بيغطي حالتين:
 * 1) الانتقال العادي: من مرحلة 1 لمرحلة 2 في نفس المستوى.
 * 2) الانتقال عبر حدود المستوى: من آخر مرحلة في مستوى 1
 *    لأول مرحلة في مستوى 2 (فتح مستوى جديد بالكامل).
 * =====================================================
 */

// --- محاكاة (mock) بيانات المستويات/المراحل والأسئلة ---
// مستوى 1: مرحلتين فقط (لتسهيل اختبار "نفس المستوى")
// مستوى 2: مرحلة واحدة (لاختبار "عبور حدود المستوى")
const mockLevels = [
  {
    id: 1, level_id: undefined, name_ar: 'سهل', name_en: 'LEVEL 1', difficulty: 'سهل', max_points: 100,
    stages: [
      { id: 1, level_id: 1, title: 'مرحلة 1-1', description: 'وصف 1-1', order_index: 1, emoji: '🏜️' },
      { id: 2, level_id: 1, title: 'مرحلة 1-2', description: 'وصف 1-2', order_index: 2, emoji: '🏛️' },
    ],
  },
  {
    id: 2, name_ar: 'متوسط', name_en: 'LEVEL 2', difficulty: 'متوسط', max_points: 100,
    stages: [
      { id: 1, level_id: 2, title: 'مرحلة 2-1', description: 'وصف 2-1', order_index: 1, emoji: '🏺' },
    ],
  },
];

// سؤال واحد فقط لكل مرحلة (يكفي لاختبار الانتقال، مش محتاجين 10)
function questionsFor(levelId, stageId) {
  return [{
    id: 1,
    question: `سؤال تجريبي للمستوى ${levelId} / المرحلة ${stageId}`,
    options: ['أ', 'ب', 'ج', 'د'],
    correct_index: 0,
    explanation: 'شرح تجريبي',
  }];
}

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      // هذا الاختبار لا يفحص تسجيل الدخول نفسه، فقط الانتقال بين
      // المراحل — نحاكي "مفيش جلسة" عشان AppContext يكمل عادي
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: (table) => {
      if (table === 'levels') {
        return {
          select: () => ({
            order: () => Promise.resolve({ data: mockLevels, error: null }),
          }),
        };
      }
      if (table === 'questions') {
        let levelId, stageId;
        const builder = {
          select: () => builder,
          eq: (col, val) => {
            if (col === 'level_id') levelId = val;
            if (col === 'stage_id') stageId = val;
            return builder;
          },
          order: () => Promise.resolve({ data: questionsFor(levelId, stageId), error: null }),
        };
        return builder;
      }
      return { select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) };
    },
  },
}));

// مكوّن اختبار صغير: بيعرض QuizPage مباشرة على مرحلة محددة
// (بيتخطى الصفحة الرئيسية وقائمة المراحل عشان نركّز على الباگ نفسه)
function TestHarness({ startLevelId, startStageId }) {
  const { navigateTo, currentPage } = useApp();
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (!started) {
      navigateTo('quiz', { levelId: startLevelId, stageId: startStageId });
      setStarted(true);
    }
  }, [started, navigateTo, startLevelId, startStageId]);

  if (currentPage !== 'quiz' || !started) return <div>loading-harness</div>;
  return <QuizPage />;
}

function renderQuiz(startLevelId, startStageId) {
  return render(
    <AppProvider>
      <TestHarness startLevelId={startLevelId} startStageId={startStageId} />
    </AppProvider>
  );
}

async function answerAndFinish() {
  // ينتظر ظهور سؤال حقيقي (مش شاشة تحميل)، يجاوب، ويضغط "عرض النتيجة"
  const firstOption = await screen.findByText('أ');
  fireEvent.click(firstOption);
  const nextBtn = await screen.findByRole('button', { name: /عرض النتيجة|السؤال التالي/ });
  fireEvent.click(nextBtn);
}

describe('QuizPage - الانتقال من مرحلة لمرحلة', () => {
  it('ينتقل لأسئلة جديدة فعلياً عند الضغط على "المرحلة التالية" (نفس المستوى)', async () => {
    renderQuiz(1, 1);

    await answerAndFinish();

    // شاشة النتيجة ظهرت، وفيها زر "المرحلة التالية"
    const nextStageBtn = await screen.findByText('المرحلة التالية');
    fireEvent.click(nextStageBtn);

    // 🔑 التحقق الحاسم: المفروض نشوف سؤال المرحلة 1-2 الجديد،
    // مش شاشة نتيجة المرحلة 1-1 القديمة تاني
    await waitFor(() => {
      expect(screen.getByText('سؤال تجريبي للمستوى 1 / المرحلة 2')).toBeInTheDocument();
    });
    expect(screen.queryByText('المرحلة التالية')).not.toBeInTheDocument();
  });

  it('ينتقل لمستوى جديد بالكامل عند إنهاء آخر مرحلة في المستوى', async () => {
    renderQuiz(1, 1); // يبدأ من أول مرحلة (مش قفزة مباشرة لآخر مرحلة، عشان يحاكي مسار لاعب حقيقي)

    // أكمل المرحلة 1-1 أولاً (شرط حقيقي لفتح 1-2)
    await answerAndFinish();
    const nextStageBtn = await screen.findByText('المرحلة التالية');
    fireEvent.click(nextStageBtn);
    await waitFor(() => {
      expect(screen.getByText('سؤال تجريبي للمستوى 1 / المرحلة 2')).toBeInTheDocument();
    });

    // ودلوقتي أكمل آخر مرحلة في المستوى (1-2) فعلياً
    await answerAndFinish();

    const nextLevelBtn = await screen.findByText('الانتقال للمستوى التالي');
    fireEvent.click(nextLevelBtn);

    // المفروض ننتقل لأول مرحلة في المستوى 2
    await waitFor(() => {
      expect(screen.getByText('سؤال تجريبي للمستوى 2 / المرحلة 1')).toBeInTheDocument();
    });
  });
});
