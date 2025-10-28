import 'package:json_annotation/json_annotation.dart';

part 'categoria.g.dart';

@JsonSerializable()
class Categoria {
  final int? id;
  final String? nombre;

  const Categoria({
    this.id,
    this.nombre,
  });

  factory Categoria.fromJson(Map<String, dynamic> json) => _$CategoriaFromJson(json);
  Map<String, dynamic> toJson() => _$CategoriaToJson(this);

  Categoria copyWith({
    int? id,
    String? nombre,
  }) {
    return Categoria(
      id: id ?? this.id,
      nombre: nombre ?? this.nombre,
    );
  }

  @override
  String toString() {
    return 'Categoria(id: \$id, nombre: \$nombre)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Categoria && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}