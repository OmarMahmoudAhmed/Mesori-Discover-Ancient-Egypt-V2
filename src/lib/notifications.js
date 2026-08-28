/*
 * =====================================================
 * notifications.js - إشعارات محلية عبر Capacitor
 * =====================================================
 * تمهيد لإشعارات "حد تخطاك / تخطيت حد في الترتيب" على أندرويد.
 *
 * ⚠️ حدود مهمة: الدالتين هنا بيتصلوا بيهم لما LeaderboardPage
 * تكتشف تغيّر فعلي (سواء لحظة فتح الصفحة، أو لحظياً عبر اشتراك
 * Realtime وانت واقف فيها — راجع LeaderboardPage.jsx). ده تمهيد
 * حقيقي شغّال، لكنه لسه محتاج التطبيق يكون مفتوح (على أي صفحة،
 * مش شرط الليدربورد بالظبط لو حبينا نوسّع الاشتراك لاحقاً) عشان
 * يستقبل حدث الـ Realtime أصلاً. إشعار push حقيقي والتطبيق مقفول
 * تماماً من كذا ساعة محتاج مشروع منفصل: Firebase Cloud Messaging +
 * دالة سيرفر (Supabase Edge Function) بتستمع لتغييرات
 * leaderboard_stats على مستوى قاعدة البيانات نفسها (مش من جهاز
 * المستخدم) وترسل push عبر FCM. الطبقة الحالية (اكتشاف + استدعاء
 * واحد واضح) هتفضل هي نفسها لما تضاف الطبقة دي — بس هيتغيّر جواها
 * LocalNotifications.schedule لإرسال فعلي من السيرفر بدل المحلي.
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

let permissionChecked = false;

async function ensurePermission() {
  if (!Capacitor.isNativePlatform()) return false; // على المتصفح العادي مفيش إشعارات نظام حقيقية
  if (permissionChecked) return true;

  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') {
      const requested = await LocalNotifications.requestPermissions();
      if (requested.display !== 'granted') return false;
    }
    permissionChecked = true;
    return true;
  } catch (err) {
    console.error('❌ فشل التحقق من إذن الإشعارات:', err);
    return false;
  }
}

/* حد تخطاك في الترتيب (رقم ترتيبك زاد) */
export async function notifyRankOvertaken({ newRank, previousRank }) {
  const granted = await ensurePermission();
  if (!granted) return;

  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: Date.now() % 1000000,
        title: 'حد تخطاك في الترتيب! 🏆',
        body: `نزل ترتيبك من المركز ${previousRank} للمركز ${newRank} — ارجع العب وخد مكانك تاني!`,
        schedule: { at: new Date(Date.now() + 500) },
      }],
    });
  } catch (err) {
    console.error('❌ فشل إطلاق إشعار تخطي الترتيب:', err);
  }
}

/* تخطيت حد في الترتيب (رقم ترتيبك قلّ) */
export async function notifyRankImproved({ newRank, previousRank }) {
  const granted = await ensurePermission();
  if (!granted) return;

  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: Date.now() % 1000000,
        title: 'تخطيت حد في الترتيب! 🎉',
        body: `طلعت من المركز ${previousRank} للمركز ${newRank} — كمّل كده وحافظ على مكانك!`,
        schedule: { at: new Date(Date.now() + 500) },
      }],
    });
  } catch (err) {
    console.error('❌ فشل إطلاق إشعار تحسّن الترتيب:', err);
  }
}
