import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/categoria.dart';
import '../config/api_config.dart';

class CategoriaService {
  static const String _baseUrl = ApiConfig.baseUrl;
  static const String _endpoint = 'categoria';

  // Obtener todos los registros
  static Future<List<Categoria>> getAll() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/$_endpoint'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = json.decode(response.body);
        return jsonList.map((json) => Categoria.fromJson(json)).toList();
      } else {
        throw Exception('Error al obtener categoria: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Obtener por ID
  static Future<Categoria?> getById(int id) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/$_endpoint/$id'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return Categoria.fromJson(json.decode(response.body));
      } else if (response.statusCode == 404) {
        return null;
      } else {
        throw Exception('Error al obtener categoria: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Crear nuevo registro
  static Future<Categoria> create(Categoria categoria) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/$_endpoint'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(categoria.toJson()),
      );

      if (response.statusCode == 201) {
        return Categoria.fromJson(json.decode(response.body));
      } else {
        throw Exception('Error al crear categoria: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Actualizar registro
  static Future<Categoria> update(int id, Categoria categoria) async {
    try {
      final response = await http.put(
        Uri.parse('$_baseUrl/$_endpoint/$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(categoria.toJson()),
      );

      if (response.statusCode == 200) {
        return Categoria.fromJson(json.decode(response.body));
      } else {
        throw Exception('Error al actualizar categoria: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Actualización parcial
  static Future<Categoria> partialUpdate(int id, Map<String, dynamic> updates) async {
    try {
      final response = await http.patch(
        Uri.parse('$_baseUrl/$_endpoint/$id'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(updates),
      );

      if (response.statusCode == 200) {
        return Categoria.fromJson(json.decode(response.body));
      } else {
        throw Exception('Error al actualizar categoria: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Eliminar registro
  static Future<bool> delete(int id) async {
    try {
      final response = await http.delete(
        Uri.parse('$_baseUrl/$_endpoint/$id'),
        headers: {'Content-Type': 'application/json'},
      );

      return response.statusCode == 204;
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  // Contar registros
  static Future<int> count() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/$_endpoint/count'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Error al contar categoria: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}