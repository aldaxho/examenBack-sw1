import 'package:flutter/material.dart';
import '../models/pedido.dart';
import '../services/pedido_service.dart';

class PedidoFormScreen extends StatefulWidget {
  final Pedido? item;

  const PedidoFormScreen({Key? key, this.item}) : super(key: key);

  @override
  State<PedidoFormScreen> createState() => _PedidoFormScreenState();
}

class _PedidoFormScreenState extends State<PedidoFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  // Controladores para los campos
  final _fechaController = TextEditingController();
  final _totalController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.item != null) {
      _loadItemData();
    }
  }

  void _loadItemData() {
    final item = widget.item!;
    _fechaController.text = item.fecha?.toString() ?? '';
    _totalController.text = item.total?.toString() ?? '';
  }

  @override
  void dispose() {
    _fechaController.dispose();
    _totalController.dispose();
    super.dispose();
  }

  Future<void> _saveItem() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final item = Pedido(
        id: widget.item?.id,
        fecha: _fechaController.text.isEmpty ? null : _fechaController.text,
        total: _totalController.text.isEmpty ? null : _totalController.text,
      );

      if (widget.item == null) {
        await PedidoService.create(item);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pedido creado correctamente')),
        );
      } else {
        await PedidoService.update(item.id!, item);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pedido actualizado correctamente')),
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
        title: Text(widget.item == null ? 'Nuevo Pedido' : 'Editar Pedido'),
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
              controller: _fechaController,
              decoration: InputDecoration(
                labelText: 'Fecha',
                border: const OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Este campo es requerido';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _totalController,
              decoration: InputDecoration(
                labelText: 'Total',
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