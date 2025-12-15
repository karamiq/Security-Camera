import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { NotificationService } from '../firebase/notification.service';

export class MotionTriggerDto {
  motion?: boolean;
  motionValue?: number;
}

@ApiTags('motion')
@Controller('motion')
export class MotionController {
  private readonly logger = new Logger(MotionController.name);

  constructor(private readonly notificationService: NotificationService) { }

  @Post('trigger')
  @ApiOperation({
    summary: 'Trigger motion detection',
    description: 'Process a motion trigger event from the motion sensor',
  })
  @ApiBody({
    type: MotionTriggerDto,
    description: 'Motion trigger data from ESP device',
    examples: {
      example1: {
        value: { motion: true },
        description: 'Motion detected from ESP',
      },
      example2: {
        value: { motionValue: 1 },
        description: 'Motion detected with value',
      },
      example3: {
        value: {},
        description: 'Motion trigger without value',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Motion trigger processed successfully',
    schema: {
      example: {
        success: true,
        message: 'Motion trigger processed',
        timestamp: '2025-12-10T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to process motion trigger',
    schema: {
      example: {
        success: false,
        message: 'Failed to process motion trigger',
        error: 'Error message',
      },
    },
  })
  async handleMotionTrigger(@Body() data: MotionTriggerDto) {
    try {
      this.logger.log(`Motion trigger received: ${JSON.stringify(data)}`);

      // Handle both 'motion' boolean from ESP and 'motionValue' numeric
      const motionDetected = data.motion === true || data.motionValue !== undefined;
      
      if (motionDetected) {
        try {
          await this.notificationService.sendMotionAlert(data.motionValue);
          this.logger.log('Motion notification sent');
        } catch (notificationError) {
          this.logger.error(`Failed to send notification: ${notificationError.message}`);
        }
      }

      return {
        success: true,
        message: 'Motion trigger processed',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing motion trigger', error?.message || error);
      return {
        success: false,
        message: 'Failed to process motion trigger',
        error: error?.message || 'Unknown error',
      };
    }
  }
}