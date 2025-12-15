import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:security_camera/components/servo_controller.dart';
import 'package:security_camera/services/websockets_service.dart';
import '../services/servo_service.dart';

class CameraStreamPage extends StatefulWidget {
  const CameraStreamPage({super.key});

  @override
  State<CameraStreamPage> createState() => _CameraStreamPageState();
}

class _CameraStreamPageState extends State<CameraStreamPage> {
  final WebSocketService _ws = WebSocketService();
  final ServoService _servo = ServoService();
  Uint8List? frame;
  String status = 'Disconnected';
  int x = 90;
  int y = 90;
  @override
  void initState() {
    super.initState();

    _ws.onFrame = (img) => setState(() => frame = img);
    _ws.onStatus = (s) => setState(() => status = s);
    _ws.connect();

    _loadAngles();
  }

  Future<void> _loadAngles() async {
    final data = await _servo.getAngles();
    if (data != null) {
      setState(() {
        x = data['x'];
        y = data['y'];
      });
    }
  }

  @override
  void dispose() {
    _ws.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Camera Stream")),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            width: double.infinity,
            color: _ws.isConnected ? Colors.green.shade800 : Colors.red.shade800,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(status, textAlign: TextAlign.center),
                if (!_ws.isConnected) ...[
                  const SizedBox(width: 16),
                  ElevatedButton.icon(
                    onPressed: () => _ws.manualReconnect(),
                    icon: const Icon(Icons.refresh, size: 18),
                    label: const Text('Reconnect'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                  ),
                ],
              ],
            ),
          ),

          Expanded(
            child: Center(
              child: frame != null
                  ? Image.memory(frame!)
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.videocam_off, size: 64, color: Colors.grey),
                        const SizedBox(height: 16),
                        Text(
                          _ws.isConnected ? "Waiting for stream..." : "Camera not connected",
                          style: const TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: ServoControlWidget(initialX: x, initialY: y),
          ),
        ],
      ),
    );
  }
}
