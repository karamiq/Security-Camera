import 'package:flutter/material.dart';
import 'pages/camera_stream_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WebSocket Camera Stream',
      theme: ThemeData.dark(),
      home: const CameraStreamPage(),
    );
  }
}
