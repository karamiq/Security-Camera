import 'dart:typed_data';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class WebSocketService {
  WebSocketChannel? _channel;

  bool isConnected = false;
  String status = 'Disconnected';
  Uint8List? imageData;
  bool _isReconnecting = false;

  // Use 10.0.2.2 for Android emulator to access host machine's localhost
  // Change this to your actual server IP address if running on physical device
  final String wsUrl = 'ws://10.0.2.2:3001/camera';

  Function(Uint8List?)? onFrame;
  Function(String)? onStatus;

  void connect() {
    if (_isReconnecting) return;

    try {
      status = 'Connecting...';
      onStatus?.call(status);

      // Close existing connection if any
      _channel?.sink.close();

      _channel = WebSocketChannel.connect(Uri.parse(wsUrl));

      _channel!.stream.listen(
        (data) {
          isConnected = true;
          _isReconnecting = false;
          status = 'Connected';
          onStatus?.call(status);

          if (data is String) {
            try {
              imageData = base64Decode(data);
            } catch (_) {}
          } else if (data is List<int>) {
            imageData = Uint8List.fromList(data);
          }

          onFrame?.call(imageData);
        },
        onError: (e) {
          isConnected = false;
          _isReconnecting = false;
          status = 'Error: Connection refused';
          onStatus?.call(status);
        },
        onDone: () {
          isConnected = false;
          _isReconnecting = false;
          status = 'Disconnected';
          onStatus?.call(status);
        },
        cancelOnError: true,
      );
    } catch (e) {
      isConnected = false;
      _isReconnecting = false;
      status = 'Connection failed: Cannot reach server';
      onStatus?.call(status);
    }
  }

  void reconnect() {
    if (_isReconnecting || isConnected) return;

    _isReconnecting = true;
    status = 'Reconnecting...';
    onStatus?.call(status);

    Future.delayed(const Duration(seconds: 2), () {
      if (!isConnected) {
        _isReconnecting = false;
        connect();
      }
    });
  }

  void manualReconnect() {
    _isReconnecting = false;
    connect();
  }

  void disconnect() {
    _channel?.sink.close();
    isConnected = false;
    status = 'Disconnected';
    onStatus?.call(status);
    onFrame?.call(null);
  }
}
