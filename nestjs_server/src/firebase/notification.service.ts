import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import * as admin from 'firebase-admin';

export interface NotificationPayload {
  title: string;
  body: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly DEFAULT_TOKEN = 'fGHeGWYSSZG51y6CZtVfPi:APA91bEga0gEJnfR5B3ftIuSoNxz_Xu2rWUbCDuBjm2rf_WWRWX7WEPwlGbaIp5v-lKz2h0bo-6YkNKwnawqyAHJS_VmyvcbvIvKiCZtubj_3d3TQFKZDlw';
  private deviceToken: string = this.DEFAULT_TOKEN;

  constructor(private firebaseService: FirebaseService) { }

  setDeviceToken(token?: string) {
    this.deviceToken = token || this.DEFAULT_TOKEN;
    this.logger.log(`Device token ${token ? 'updated' : 'reset to default'}`);
  }

  getDeviceToken(): string {
    return this.deviceToken;
  }

  async sendNotification(payload: NotificationPayload): Promise<string | null> {
    if (!this.firebaseService.isInitialized()) {
      this.logger.warn('Firebase not initialized');
      return null;
    }

    if (!this.deviceToken) {
      this.logger.warn('No device token registered');
      return null;
    }

    try {
      const message: admin.messaging.Message = {
        token: this.deviceToken,
        notification: {
          title: payload.title,
          body: payload.body,
        },
      };

      const response = await this.firebaseService.getMessaging().send(message);
      this.logger.log('Notification sent successfully');
      return response;
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      throw error;
    }
  }

  async sendMotionAlert(motionValue?: number): Promise<any> {
    return this.sendNotification({
      title: 'Motion Detected',
      body: `Motion detected${motionValue ? ` (value: ${motionValue})` : ''}`,
    });
  }
}
