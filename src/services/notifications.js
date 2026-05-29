// saflash — Notification service
import * as Notifications from 'expo-notifications';
import { getConfig } from '../database/sessionRepository';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyNotification() {
  const config = await getConfig();

  if (!config || !config.notifications) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return;
  }

  // Cancel existing schedule
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule new daily notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📚 ¡Hora de estudiar inglés!',
      body: 'Dedica unos minutos a tus tarjetas de hoy. ¡Cada palabra cuenta!',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: config.notif_hour || 9,
      minute: 0,
    },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function sendImmediateNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // immediate
  });
}
