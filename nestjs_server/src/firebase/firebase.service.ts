import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { firebaseConfig } from './firebase.config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App;

  onModuleInit() {
    try {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          privateKey: firebaseConfig.privateKey,
          clientEmail: firebaseConfig.clientEmail,
        }),
      });
      this.logger.log('Firebase initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase', error.stack);
    }
  }

  getApp(): admin.app.App {
    return this.app;
  }

  getMessaging(): admin.messaging.Messaging {
    if (!this.app) {
      throw new Error('Firebase is not initialized');
    }
    return this.app.messaging();
  }

  isInitialized(): boolean {
    return !!this.app;
  }
}