import 'package:json_annotation/json_annotation.dart';

part 'pedido.g.dart';

@JsonSerializable()
class Pedido {
  final int? id;
  final String? fecha;
  final String? total;

  const Pedido({
    this.id,
    this.fecha,
    this.total,
  });

  factory Pedido.fromJson(Map<String, dynamic> json) => _$PedidoFromJson(json);
  Map<String, dynamic> toJson() => _$PedidoToJson(this);

  Pedido copyWith({
    int? id,
    String? fecha,
    String? total,
  }) {
    return Pedido(
      id: id ?? this.id,
      fecha: fecha ?? this.fecha,
      total: total ?? this.total,
    );
  }

  @override
  String toString() {
    return 'Pedido(id: \$id, fecha: \$fecha, total: \$total)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Pedido && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}