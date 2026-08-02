import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

/*
 * =====================================================
 * اختبار: بوابة تسجيل الدخول في App.jsx
 * =====================================================
 * يتأكد إن التطبيق بيوجّه المستخدم للصفحة الصح حسب حالته:
 * مفيش جلسة → LoginPage
 * فيه جلسة بس لسه ما اختارش بياناته → OnboardingPage
 * بعد إكمال Onboarding → الصفحة الرئيسية (HomePage)
 * =====================================================
 */

const FAKE_USER_ID = '99999999-9999-9999-9999-999999999999';
let mockSession = null; // يتغيّر بين الاختبارات لمحاكاة حالات مختلفة
let mockProfile = { onboarding_completed: false, username: '', age: null, character: 'boy', total_points: 0, id: FAKE_USER_ID };
let authChangeCallback = null;

vi.mock('./lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: mockSession } }),
      onAuthStateChange: (cb) => {
        authChangeCallback = cb;
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    rpc: () => Promise.resolve({ error: null }),
    channel: () => ({ on: () => ({ subscribe: () => {} }) }),
    removeChannel: () => {},
    from: (table) => {
      if (table === 'levels') {
        return { select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) };
      }
      if (table === 'profiles') {
        const builder = {
          select: () => builder,
          update: (updates) => {
            mockProfile = { ...mockProfile, ...updates };
            return { eq: () => Promise.resolve({ error: null }) };
          },
          eq: () => builder,
          single: () => Promise.resolve({ data: mockProfile, error: null }),
        };
        return builder;
      }
      if (table === 'leaderboard') {
        return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }) };
      }
      // user_badges / notifications / أي جدول آخر: select().eq().order()/limit() فاضي
      const emptyBuilder = {
        select: () => emptyBuilder,
        eq: () => emptyBuilder,
        order: () => emptyBuilder,
        limit: () => Promise.resolve({ data: [], error: null }),
        then: (resolve) => resolve({ data: [], error: null }), // يخلي await مباشر يشتغل كمان
      };
      return emptyBuilder;
    },
  },
}));

describe('App - بوابة تسجيل الدخول', () => {
  it('يعرض صفحة تسجيل الدخول لو مفيش جلسة', async () => {
    mockSession = null;
    render(<App />);
    expect(await screen.findByText('ابدأ الرحلة')).toBeInTheDocument();
  });

  it('يعرض شاشة Onboarding لو فيه جلسة بس البروفايل لسه فاضي', async () => {
    mockSession = { user: { id: FAKE_USER_ID, user_metadata: {} } };
    mockProfile = { onboarding_completed: false, username: '', age: null, character: 'boy', total_points: 0, id: FAKE_USER_ID };

    render(<App />);
    expect(await screen.findByText('أهلاً بيك في ميسوري!')).toBeInTheDocument();
  });

  it('ينتقل للصفحة الرئيسية تلقائياً بعد إكمال Onboarding', async () => {
    mockSession = { user: { id: FAKE_USER_ID, user_metadata: {} } };
    mockProfile = { onboarding_completed: false, username: '', age: null, character: 'boy', total_points: 0, id: FAKE_USER_ID };

    render(<App />);
    await screen.findByText('أهلاً بيك في ميسوري!');

    fireEvent.change(screen.getByPlaceholderText('مثال: أحمد'), { target: { value: 'يوسف' } });
    fireEvent.change(screen.getByPlaceholderText('مثال: 10'), { target: { value: '11' } });
    fireEvent.click(screen.getByText('ذكر'));
    fireEvent.click(screen.getByText('ابدأ المغامرة 🚀'));

    // completeOnboarding بيحدّث onboarding_completed محلياً فور النجاح،
    // فالمفروض التطبيق يعدي مباشرة لصفحة تانية (مش Onboarding ولا Login)
    await waitFor(() => {
      expect(screen.queryByText('أهلاً بيك في ميسوري!')).not.toBeInTheDocument();
    });
  });
});
