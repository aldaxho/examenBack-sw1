import 'package:flutter/material.dart';
import '../models/detallepedido.dart';
import '../services/detallepedido_service.dart';

class DetallePedidoFormScreen extends StatefulWidget {
  final DetallePedido? item;

  const DetallePedidoFormScreen({Key? key, this.item}) : super(key: key);

  @override
  State<DetallePedidoFormScreen> createState() => _DetallePedidoFormScreenState();
}

class _DetallePedidoFormScreenState extends State<DetallePedidoFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  // Controladores para los campos
  final _cantidadController = TextEditingController();
  final _precio_unitarioController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.item != null) {
      _loadItemData();
    }
  }

  void _loadItemData() {
    final item = widget.item!;
    _cantidadController.text = item.cantidad?.toString() ?? '';
    _precio_unitarioController.text = item.precio_unitario?.toString() ?? '';
  }

  @override
  void dispose() {
    _cantidadController.dispose();
    _precio_unitarioController.dispose();
    super.dispose();
  }

  Future<void> _saveItem() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final item = DetallePedido(
        id: widget.item?.id,
        cantidad: _cantidadController.text.isEmpty ? null : _cantidadController.text,
        precio_unitario: _precio_unitarioController.text.isEmpty ? null : _precio_unitarioController.text,
      );

      if (widget.item == null) {
        await DetallePedidoService.create(item);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('DetallePedido creado correctamente')),
        );
      } else {
        await DetallePedidoService.update(item.id!, item);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('DetallePedido actualizado correctamente')),
        );
      }

      Navigator.of(context).pop(true);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.item == null ? 'Nuevo DetallePedido' : 'Editar DetallePedido'),
        actions: [
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else
            TextButton(
              onPressed: _saveItem,
              child: const Text('Guardar'),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _cantidadController,
              decoration: InputDecoration(
                labelText: 'Cantidad',
                border: const OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Este campo es requerido';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _precio_unitarioController,
              decoration: InputDecoration(
                labelText: 'Precio_unitario',
                border: const OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Este campo es requerido';
                return null;
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}