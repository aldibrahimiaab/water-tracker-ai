import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const useNotifications = () => {
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7F',
      });
    }
  };

  const scheduleReminder = async (title: string, body: string, trigger: number) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          badge: 1,
        },
        trigger: { seconds: trigger },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const scheduleWaterReminders = async (dailyGoal: number, startHour: number = 8, endHour: number = 20) => {
    try {
      // Calculate number of reminders needed (one every 2 hours)
      const remindersPerDay = (endHour - startHour) / 2;
      const cupsPerReminder = Math.ceil(dailyGoal / (GLASS_SIZE * remindersPerDay));

      for (let i = 0; i < remindersPerDay; i++) {
        const hour = startHour + i * 2;
        const now = new Date();
        const reminderTime = new Date(now);
        reminderTime.setHours(hour, 0, 0, 0);

        // If the time has already passed today, schedule for tomorrow
        if (reminderTime < now) {
          reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const trigger = Math.floor((reminderTime.getTime() - now.getTime()) / 1000);

        if (trigger > 0) {
          await scheduleReminder(
            '💧 Water Reminder',
            `Don't forget to drink water! You still have ${cupsPerReminder} cups to go.`,
            trigger
          );
        }
      }
    } catch (error) {
      console.error('Error scheduling water reminders:', error);
    }
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  return {
    scheduleReminder,
    scheduleWaterReminders,
    cancelAllNotifications,
  };
};

const GLASS_SIZE = 250; // ml
