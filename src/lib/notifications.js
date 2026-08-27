/*
 * =====================================================
 * notifications.js - إشعارات محلية عبر Capacitor
 * =====================================================
 * تمهيد لإشعارات "حد تخطاك في الترتيب" على أندرويد.
 *
 * ⚠️ حدود متعمّدة — مهم تعرفها قبل ما تعتمد عليها بالكامل:
 * الدالة دي بتشتغل بس لما المستخدم يفتح صفحة الليدربورد فعلياً
 * (بتكتشف إنه اتخطى منذ آخر زيارة، وتطلق إشعار محلي فوري وقتها).
 * ده تمهيد حقيقي شغّال فعلاً — منطق الاكتشاف وحلقة الاتصال بـ
 * Capacitor جاهزين تماماً — لكنه مختلف عن إشعار push حقيقي يوصلك
 * وانت مقفل التطبيق من كذا يوم من غير ما تفتحه خالص. ده محتاج
 * مشروع منفصل: Firebase Cloud Messaging + Supabase Edge Function
 * مجدولة تقارن الترتيب دورياً على السيرفر + استبدال
 * @capacitor/local-notifications بـ @capacitor/push-notifications.
 * الجزء اللي هنا (نقطة استدعاء واحدة واضحة عند اكتشاف overtaken)
 * هيفضل هو نفسه لما تضيف الطبقة دي لاحقاً — بس هتستبدل جوّاها
 * LocalNotifications.schedule بإرسال فعلي للسيرفر.
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

let permissionChecked = false;

async function ensurePermission() {
  // على المتصفح العادي (مش تطبيق Capacitor مُغلّف) مفيش إشعارات نظام حقيقية
  if (!Capacitor.isNativePlatform()) return false;
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

/*
 * تُستدعى من LeaderboardPage عند اكتشاف overtaken: true (حد نزّل
 * ترتيبك). newRank/previousRank أرقام الترتيب الجديد والقديم.
 */
export async function notifyRankOvertaken({ newRank, previousRank }) {
  const granted = await ensurePermission();
  if (!granted) return;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now() % 1000000,
          title: 'حد تخطاك في الترتيب! 🏆',
          body: `نزل ترتيبك من المركز ${previousRank} للمركز ${newRank} — ارجع العب وخد مكانك تاني!`,
          schedule: { at: new Date(Date.now() + 500) },
        },
      ],
    });
  } catch (err) {
    console.error('❌ فشل إطلاق إشعار تخطي الترتيب:', err);
  }
}
