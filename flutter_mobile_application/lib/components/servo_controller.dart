import 'package:flutter/material.dart';
import '../services/servo_service.dart';

class ServoControlWidget extends StatefulWidget {
  final int initialX;
  final int initialY;

  const ServoControlWidget({super.key, required this.initialX, required this.initialY});

  @override
  State<ServoControlWidget> createState() => _ServoControlWidgetState();
}

class _ServoControlWidgetState extends State<ServoControlWidget> {
  final ServoService _servo = ServoService();

  late int xAngle;
  late int yAngle;
  bool _isHolding = false;

  @override
  void initState() {
    super.initState();
    xAngle = widget.initialX;
    yAngle = widget.initialY;
  }

  void _update() {
    xAngle = xAngle.clamp(0, 180);
    yAngle = yAngle.clamp(0, 180);
    _servo.setAngles(xAngle, yAngle);
    setState(() {});
  }

  void _startHolding(VoidCallback adjustAngle) async {
    _isHolding = true;
    adjustAngle();
    _update();

    await Future.delayed(const Duration(milliseconds: 300));

    while (_isHolding) {
      adjustAngle();
      _update();
      await Future.delayed(const Duration(milliseconds: 50));
    }
  }

  void _stopHolding() {
    _isHolding = false;
  }

  Widget _circleButton(IconData icon, VoidCallback adjustAngle) {
    return GestureDetector(
      onTapDown: (_) => _startHolding(adjustAngle),
      onTapUp: (_) => _stopHolding(),
      onTapCancel: () => _stopHolding(),
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.grey.shade900,
          border: Border.all(color: Colors.white24, width: 2),
          boxShadow: [BoxShadow(blurRadius: 6, color: Colors.black.withOpacity(0.4))],
        ),
        child: Center(child: Icon(icon, size: 28, color: Colors.white)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text("Servo Controller", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 20),

        // ----------- CIRCLE JOYSTICK SHAPE -----------
        SizedBox(
          width: 220,
          height: 220,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Outer ring
              Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey.shade800,
                  border: Border.all(color: Colors.white30, width: 4),
                ),
              ),

              // UP
              Positioned(
                top: 10,
                child: _circleButton(Icons.keyboard_arrow_up, () {
                  xAngle -= 1;
                }),
              ),

              // DOWN
              Positioned(
                bottom: 10,
                child: _circleButton(Icons.keyboard_arrow_down, () {
                  xAngle += 1;
                }),
              ),

              // LEFT
              Positioned(
                left: 10,
                child: _circleButton(Icons.keyboard_arrow_left, () {
                  yAngle -= 1;
                }),
              ),

              // RIGHT
              Positioned(
                right: 10,
                child: _circleButton(Icons.keyboard_arrow_right, () {
                  yAngle += 1;
                }),
              ),

              // Center circle
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey.shade700,
                  border: Border.all(color: Colors.white38, width: 2),
                ),
                child: Center(
                  child: Text(
                    "$xAngle°\n$yAngle°",
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, height: 1.2),
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 12),
      ],
    );
  }
}
