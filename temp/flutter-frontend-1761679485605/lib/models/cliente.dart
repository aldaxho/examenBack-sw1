import 'package:json_annotation/json_annotation.dart';

part 'cliente.g.dart';

@JsonSerializable()
class Cliente {
  final int? id;
  final String? nombre;
  final String? correo_electronico;
  final String? telefono;
  final String? direccion;

  const Cliente({
    this.id,
    this.nombre,
    this.correo_electronico,
    this.telefono,
    this.direccion,
  });

  factory Cliente.fromJson(Map<String, dynamic> json) => _$ClienteFromJson(json);
  Map<String, dynamic> toJson() => _$ClienteToJson(this);

  Cliente copyWith({
    int? id,
    String? nombre,
    String? correo_electronico,
    String? telefono,
    String? direccion,
  }) {
    return Cliente(
      id: id ?? this.id,
      nombre: nombre ?? this.nombre,
      correo_electronico: correo_electronico ?? this.correo_electronico,
      telefono: telefono ?? this.telefono,
      direccion: direccion ?? this.direccion,
    );
  }

  @override
  String toString() {
    return 'Cliente(id: \$id, nombre: \$nombre, correo_electronico: \$correo_electronico, telefono: \$telefono, direccion: \$direccion)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Cliente && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}