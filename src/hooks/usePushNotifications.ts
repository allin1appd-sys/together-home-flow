import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const usePushNotifications = () => {
  const { user } = useAuth();

  const registerToken = useCallback(async (token: string) => {
    if (!user) return;
    const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
    await supabase.from('push_tokens' as any).upsert(
      { user_id: user.id, token, platform },
      { onConflict: 'token' }
    );
  }, [user]);

  const removeToken = useCallback(async () => {
    if (!user) return;
    await supabase.from('push_tokens' as any).delete().eq('user_id', user.id);
  }, [user]);

  useEffect(() => {
    if (!user || !Capacitor.isNativePlatform()) return;

    const setup = async () => {
      const permResult = await PushNotifications.checkPermissions();
      if (permResult.receive === 'prompt') {
        const req = await PushNotifications.requestPermissions();
        if (req.receive !== 'granted') return;
      } else if (permResult.receive !== 'granted') {
        return;
      }

      await PushNotifications.register();
    };

    setup();

    const registrationListener = PushNotifications.addListener('registration', (token) => {
      registerToken(token.value);
    });

    const notificationReceivedListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('Push received:', notification);
      }
    );

    const notificationActionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action) => {
        console.log('Push action:', action);
        // Could navigate based on action.notification.data
      }
    );

    return () => {
      registrationListener.then(l => l.remove());
      notificationReceivedListener.then(l => l.remove());
      notificationActionListener.then(l => l.remove());
    };
  }, [user, registerToken]);

  return { removeToken };
};
