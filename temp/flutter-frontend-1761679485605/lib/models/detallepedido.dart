import 'package:json_annotation/json_annotation.dart';

part 'detallepedido.g.dart';

@JsonSerializable()
class DetallePedido {
  final int? id;
  final String? cantidad;
  final String? precio_unitario;

  const DetallePedido({
    this.id,
    this.cantidad,
    this.precio_unitario,
  });

  factory DetallePedido.fromJson(Map<String, dynamic> json) => _$DetallePedidoFromJson(json);
  Map<String, dynamic> toJson() => _$DetallePedidoToJson(this);

  DetallePedido copyWith({
    int? id,
    String? cantidad,
    String? precio_unitario,
  }) {
    return DetallePedido(
      id: id ?? this.id,
      cantidad: cantidad ?? this.cantidad,
      precio_unitario: precio_unitario ?? this.precio_unitario,
    );
  }

  @override
  String toString() {
    return 'DetallePedido(id: \$id, cantidad: \$cantidad, precio_unitario: \$precio_unitario)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DetallePedido && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}