import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CameraModule } from './camera/camera.module';
import { MotionModule } from './motion/motion.module';
import { MovementModule } from './movement/movement.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [FirebaseModule, CameraModule, MotionModule, MovementModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

