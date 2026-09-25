import 'package:dio/dio.dart';
import 'api_client.dart';

class Api {
  static Future<Response> get(String path, {Map<String, dynamic>? query}) {
    return ApiClient.dio.get(path, queryParameters: query);
  }

  static Future<Response> post(String path, {dynamic data}) {
    return ApiClient.dio.post(path, data: data);
  }

  static Future<Response> put(String path, {dynamic data}) {
    return ApiClient.dio.put(path, data: data);
  }

  static Future<Response> delete(String path) {
    return ApiClient.dio.delete(path);
  }
}
