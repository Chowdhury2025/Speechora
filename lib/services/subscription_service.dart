import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/constants.dart';

class SubscriptionService {
  static Future<Map<String, dynamic>?> fetchStatus(int userId) async {
    try {
      final uri = Uri.parse(
        '${Constants.baseUrl}/user/subscription-status?userId=$userId',
      );
      final resp = await http.get(
        uri,
        headers: {'Content-Type': 'application/json'},
      );
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body) as Map<String, dynamic>;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('subscriptionStatusRaw', resp.body);
        return data;
      }
    } catch (_) {
      // ignore
    }
    return null;
  }
}
