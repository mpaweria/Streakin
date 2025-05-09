import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useEffect } from 'react';

export const useNotificationSetup = () => {
  useEffect(() => {
    const registerForPushNotificationsAsync = async () => {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync()
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          alert('Failed to get push token for notifications!')
          return
        }
      } else {
        alert('Must use physical device for Push Notifications')
      }

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        })
      }
    }

    registerForPushNotificationsAsync()
  }, [])
}
