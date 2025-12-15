import { Module } from '@nestjs/common';
import { MotionController } from './motion.controller';
import { CameraModule } from '../camera/camera.module';

@Module({
  imports: [CameraModule],
  controllers: [MotionController],
  providers: [],
  exports: [],
})
export class MotionModule { }