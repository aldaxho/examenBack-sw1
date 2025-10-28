import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import '../config/api_config.dart';

class HttpService {
  static Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/$endpoint'),
        headers: ApiConfig.defaultHeaders,
      ).timeout(ApiConfig.timeout);

      return _handleResponse(response);
    } on SocketException {
      throw Exception('Error de conexión: Verifica tu conexión a internet');
    } on HttpException {
      throw Exception('Error HTTP: No se pudo completar la petición');
    } catch (e) {
      throw Exception('Error inesperado: $e');
    }
  }

  static Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/$endpoint'),
        headers: ApiConfig.defaultHeaders,
        body: json.encode(data),
      ).timeout(ApiConfig.timeout);

      return _handleResponse(response);
    } on SocketException {
      throw Exception('Error de conexión: Verifica tu conexión a internet');
    } on HttpException {
      throw Exception('Error HTTP: No se pudo completar la petición');
    } catch (e) {
      throw Exception('Error inesperado: $e');
    }
  }

  static Future<Map<String, dynamic>> put(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await http.put(
        Uri.parse('${ApiConfig.baseUrl}/$endpoint'),
        headers: ApiConfig.defaultHeaders,
        body: json.encode(data),
      ).timeout(ApiConfig.timeout);

      return _handleResponse(response);
    } on SocketException {
      throw Exception('Error de conexión: Verifica tu conexión a internet');
    } on HttpException {
      throw Exception('Error HTTP: No se pudo completar la petición');
    } catch (e) {
      throw Exception('Error inesperado: $e');
    }
  }

  static Future<Map<String, dynamic>> patch(String endpoint, Map<String, dynamic> data) async {
    try {
      final response = await http.patch(
        Uri.parse('${ApiConfig.baseUrl}/$endpoint'),
        headers: ApiConfig.defaultHeaders,
        body: json.encode(data),
      ).timeout(ApiConfig.timeout);

      return _handleResponse(response);
    } on SocketException {
      throw Exception('Error de conexión: Verifica tu conexión a internet');
    } on HttpException {
      throw Exception('Error HTTP: No se pudo completar la petición');
    } catch (e) {
      throw Exception('Error inesperado: $e');
    }
  }

  static Future<bool> delete(String endpoint) async {
    try {
      final response = await http.delete(
        Uri.parse('${ApiConfig.baseUrl}/$endpoint'),
        headers: ApiConfig.defaultHeaders,
      ).timeout(ApiConfig.timeout);

      return response.statusCode == 204;
    } on SocketException {
      throw Exception('Error de conexión: Verifica tu conexión a internet');
    } on HttpException {
      throw Exception('Error HTTP: No se pudo completar la petición');
    } catch (e) {
      throw Exception('Error inesperado: $e');
    }
  }

  static Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) {
        return {};
      }
      return json.decode(response.body);
    } else {
      throw Exception('Error del servidor: ${response.statusCode}');
    }
  }
}