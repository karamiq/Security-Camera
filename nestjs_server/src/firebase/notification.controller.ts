import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

class RegisterTokenDto {
  @ApiProperty({
    description: 'FCM device token. If not provided, uses default token.',
    required: false,
    example: 'fGHeGWYSSZG51y6CZtVfPi:APA91bEga0gEJnfR5B3ftIuSoNxz_Xu2rWUbCDuBjm2rf_WWRWX7WEPwlGbaIp5v-lKz2h0bo-6YkNKwnawqyAHJS_VmyvcbvIvKiCZtubj_3d3TQFKZDlw',
  })
  token?: string;
}

class SendNotificationDto {
  @ApiProperty({
    description: 'Notification title',
    example: 'Motion Alert',
  })
  title: string;
  @ApiProperty({
    description: 'Notification body message',
    example: 'Motion has been detected in your camera',
  })
  body: string;
}

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Post('register')
  @ApiOperation({
    summary: 'Register device FCM token',
    description: 'Register a Firebase Cloud Messaging device token for receiving notifications. If no token is provided, uses the default token.',
  })
  @ApiBody({
    type: RegisterTokenDto,
    examples: {
      withToken: {
        value: {
          token: 'fGHeGWYSSZG51y6CZtVfPi:APA91bEga0gEJnfR5B3ftIuSoNxz_Xu2rWUbCDuBjm2rf_WWRWX7WEPwlGbaIp5v-lKz2h0bo-6YkNKwnawqyAHJS_VmyvcbvIvKiCZtubj_3d3TQFKZDlw',
        },
        description: 'Register with a specific FCM token',
      },
      useDefault: {
        value: {},
        description: 'Use default token (no token provided)',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Device token registered successfully',
    schema: {
      example: {
        success: true,
        message: 'Device token registered',
      },
    },
  })
  registerDevice(@Body() dto: RegisterTokenDto) {
    this.notificationService.setDeviceToken(dto.token);
    return { success: true, message: 'Device token registered' };
  }

  @Post('send')
  @ApiOperation({
    summary: 'Send notification to registered device',
    description: 'Send a push notification to the currently registered device. Make sure to register a device token first using /notifications/register endpoint.',
  })
  @ApiBody({
    type: SendNotificationDto,
    examples: {
      motionAlert: {
        value: {
          title: 'Motion Detected',
          body: 'Motion has been detected in your camera',
        },
        description: 'Send motion detection alert',
      },
      testNotification: {
        value: {
          title: 'Test Notification',
          body: 'This is a test notification',
        },
        description: 'Simple test notification',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Notification sent successfully',
    schema: {
      example: {
        success: true,
        message: 'Notification sent',
        result: 'projects/your-project/messages/0:1234567890',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Failed to send notification',
    schema: {
      example: {
        success: false,
        message: 'Failed to send notification',
        error: 'Error message details',
      },
    },
  })
  async sendNotification(@Body() dto: SendNotificationDto) {
    try {
      const result = await this.notificationService.sendNotification(dto);
      return { success: true, message: 'Notification sent', result };
    } catch (error) {
      return { success: false, message: 'Failed to send notification', error: error.message };
    }
  }
}
