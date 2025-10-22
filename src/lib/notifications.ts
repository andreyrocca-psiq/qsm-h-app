import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function subscribeToPushNotifications(userId: string) {
  try {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.error('Service workers are not supported');
      return false;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Request notification permission
    const permissionGranted = await requestNotificationPermission();
    if (!permissionGranted) {
      console.error('Notification permission denied');
      return false;
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Save subscription to database
    const subscriptionData = JSON.parse(JSON.stringify(subscription));

    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: subscriptionData.endpoint,
      p256dh: subscriptionData.keys.p256dh,
      auth: subscriptionData.keys.auth,
    });

    if (error) throw error;

    console.log('Push notification subscription successful');
    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
}

export async function unsubscribeFromPushNotifications(userId: string) {
  try {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }

    // Remove from database
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);

    console.log('Push notification unsubscribe successful');
    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

export function checkNotificationSupport() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}
