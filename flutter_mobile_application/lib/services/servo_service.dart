import 'dart:convert';
import 'package:http/http.dart' as http;

class ServoService {
  // Use 10.0.2.2 for Android emulator to access host machine's localhost
  // Change this to your actual server IP address if running on physical device
  final String apiUrl = "http://10.0.2.2:3000/movement/servo-angles";

  String lastError = '';
  Function(String)? onError;

  Future<Map<String, dynamic>?> getAngles() async {
    try {
      final res = await http.get(Uri.parse(apiUrl));
      if (res.statusCode == 200) {
        lastError = '';
        return jsonDecode(res.body);
      } else {
        lastError = 'Server error: ${res.statusCode}';
        onError?.call(lastError);
      }
    } catch (e) {
      lastError = 'Cannot connect to servo server';
      onError?.call(lastError);
    }
    return null;
  }

  Future<bool> setAngles(int x, int y) async {
    try {
      final res = await http
          .post(
            Uri.parse(apiUrl),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({"x": x, "y": y}),
          )
          .timeout(const Duration(seconds: 5));

      if (res.statusCode == 200) {
        lastError = '';
        return true;
      } else {
        lastError = 'Server error: ${res.statusCode}';
        onError?.call(lastError);
        return false;
      }
    } catch (e) {
      lastError = 'Cannot connect to servo server';
      onError?.call(lastError);
      return false;
    }
  }
}
