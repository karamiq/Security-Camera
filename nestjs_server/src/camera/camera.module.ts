import { Module } from '@nestjs/common';
import { CameraGateway } from './camera.gateway';
import { CameraService } from './camera.service';

@Module({
  providers: [CameraGateway, CameraService],
  exports: [CameraGateway, CameraService],
})
export class CameraModule { }
