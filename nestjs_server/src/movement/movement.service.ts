import { Injectable } from '@nestjs/common';

export interface ServoAngles {
  x: number;
  y: number;
}

@Injectable()
export class MovementService {
  private servoAngles: ServoAngles = { x: 90, y: 90 }; // Default to half rotation (90 degrees) for both

  /**
   * Gets the current servo motor rotation angles
   * @returns The angles in degrees (0-180) for x and y
   */
  getServoAngles(): ServoAngles {
    return { ...this.servoAngles };
  }

  /**
   * Sets the servo motor rotation angles
   * @param x The x-axis angle in degrees (0-180)
   * @param y The y-axis angle in degrees (0-180)
   * @returns The new servo angles
   */
  setServoAngles(x: number, y: number): ServoAngles {
    // Validate angles are within servo range (0-180 degrees)
    if (x < 0 || x > 180) {
      throw new Error('X angle must be between 0 and 180 degrees');
    }
    if (y < 0 || y > 180) {
      throw new Error('Y angle must be between 0 and 180 degrees');
    }
    this.servoAngles = { x, y };
    return { ...this.servoAngles };
  }

  /**
   * Gets the default half rotation angle
   * @returns 90 degrees (half rotation)
   */
  getServoHalfRotationAngle(): number {
    return 90;
  }
}

