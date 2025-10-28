import 'package:json_annotation/json_annotation.dart';

part 'producto.g.dart';

@JsonSerializable()
class Producto {
  final int? id;
  final String? nombre;
  final String? descripcion;
  final String? precio;

  const Producto({
    this.id,
    this.nombre,
    this.descripcion,
    this.precio,
  });

  factory Producto.fromJson(Map<String, dynamic> json) => _$ProductoFromJson(json);
  Map<String, dynamic> toJson() => _$ProductoToJson(this);

  Producto copyWith({
    int? id,
    String? nombre,
    String? descripcion,
    String? precio,
  }) {
    return Producto(
      id: id ?? this.id,
      nombre: nombre ?? this.nombre,
      descripcion: descripcion ?? this.descripcion,
      precio: precio ?? this.precio,
    );
  }

  @override
  String toString() {
    return 'Producto(id: \$id, nombre: \$nombre, descripcion: \$descripcion, precio: \$precio)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Producto && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}