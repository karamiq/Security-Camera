import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { MovementService } from './movement.service';
import type { ServoAngles } from './movement.service';

export class SetServoAnglesDto {
  x: number;
  y: number;
}

@ApiTags('movement')
@Controller('movement')
export class MovementController {
  constructor(private readonly movementService: MovementService) { }

  @Get('servo-angles')
  @ApiOperation({
    summary: 'Get current servo angles',
    description: 'Returns the current rotation angles of the X and Y servo motors (0-180 degrees each)',
  })
  @ApiResponse({
    status: 200,
    description: 'Current servo angles for X and Y axes',
    schema: {
      example: { x: 90, y: 90 },
    },
  })
  getServoAngles(): ServoAngles {
    return this.movementService.getServoAngles();
  }

  @Post('servo-angles')
  @ApiOperation({
    summary: 'Set servo motor angles',
    description: 'Changes the rotation angles of both X and Y servo motors (0-180 degrees each)',
  })
  @ApiBody({
    type: SetServoAnglesDto,
    description: 'Servo angles for X and Y axes (0-180 degrees each)',
    examples: {
      center: {
        value: { x: 90, y: 90 },
        description: 'Both servos at center position (half rotation)',
      },
      topLeft: {
        value: { x: 45, y: 45 },
        description: 'Top-left position',
      },
      topRight: {
        value: { x: 135, y: 45 },
        description: 'Top-right position',
      },
      bottomLeft: {
        value: { x: 45, y: 135 },
        description: 'Bottom-left position',
      },
      bottomRight: {
        value: { x: 135, y: 135 },
        description: 'Bottom-right position',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Servo angles set successfully',
    schema: {
      example: {
        x: 90,
        y: 90,
        message: 'Servo angles set to X: 90°, Y: 90°',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid angle value (must be 0-180 for both X and Y)',
    schema: {
      example: {
        statusCode: 400,
        message: 'X angle must be between 0 and 180 degrees',
      },
    },
  })
  setServoAngles(@Body() data: SetServoAnglesDto): ServoAngles & { message: string } {
    try {
      const newAngles = this.movementService.setServoAngles(data.x, data.y);
      return {
        ...newAngles,
        message: `Servo angles set to X: ${newAngles.x}°, Y: ${newAngles.y}°`,
      };
    } catch (error) {
      throw error;
    }
  }
}
