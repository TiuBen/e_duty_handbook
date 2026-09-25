import 'dart:convert';
import 'package:http/http.dart' as http;

class HandoverService {
  static const baseUrl = "http://localhost:3300";

  /// 获取全部
  static Future<List<dynamic>> getList() async {
    final res = await http.get(Uri.parse('$baseUrl/handover'));

    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    } else {
      throw Exception('获取失败');
    }
  }

  /// 获取单个
  static Future<Map<String, dynamic>> getById(int id) async {
    final res = await http.get(Uri.parse('$baseUrl/handover/$id'));

    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    } else {
      throw Exception('获取失败');
    }
  }
}
