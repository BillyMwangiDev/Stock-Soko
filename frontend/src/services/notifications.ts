import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import api from '../api/client';

class NotificationService {
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async registerDevice(): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermission();
      
      if (!hasPermission) {
        return false;
      }

      const token = await this.getToken();
      
      if (!token) {
        return false;
      }

      const response = await api.post('/notifications/register-device', {
        fcm_token: token,
      });

      console.log('Device registered:', response.data);
      return response.data.success;
    } catch (error) {
      console.error('Error registering device:', error);
      return false;
    }
  }

  async unregisterDevice(): Promise<boolean> {
    try {
      const response = await api.delete('/notifications/unregister-device');
      console.log('Device unregistered:', response.data);
      return response.data.success;
    } catch (error) {
      console.error('Error unregistering device:', error);
      return false;
    }
  }

  setupNotificationListeners(
    onNotification: (notification: any) => void,
    onNotificationOpened: (notification: any) => void
  ) {
    messaging().onMessage(async remoteMessage => {
      console.log('Notification received in foreground:', remoteMessage);
      onNotification(remoteMessage);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app from background:', remoteMessage);
      onNotificationOpened(remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification opened app from quit state:', remoteMessage);
          onNotificationOpened(remoteMessage);
        }
      });
  }

  async sendTestNotification(): Promise<boolean> {
    try {
      const response = await api.post('/notifications/test');
      console.log('Test notification sent:', response.data);
      return response.data.success;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();

