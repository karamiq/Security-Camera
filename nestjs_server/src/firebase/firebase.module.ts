import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Global()
@Module({
  controllers: [NotificationController],
  providers: [FirebaseService, NotificationService],
  exports: [FirebaseService, NotificationService],
})
export class FirebaseModule { }
