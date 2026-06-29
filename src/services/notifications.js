// saflash — Notification service
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { getConfig } from '../database/sessionRepository';

const isExpoGoAndroid =
  Platform.OS === 'android' &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let notificationsModule = null;
let handlerConfigured = false;

function getNotificationsModule() {
  if (isExpoGoAndroid) {
    return null;
  }

  if (!notificationsModule) {
    notificationsModule = require('expo-notifications');
  }

  if (!handlerConfigured) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerConfigured = true;
  }

  return notificationsModule;
}

export function isNotificationsSupported() {
  return !isExpoGoAndroid;
}

export async function requestPermissions() {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyNotification() {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

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
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function sendImmediateNotification(title, body) {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // immediate
  });
}
