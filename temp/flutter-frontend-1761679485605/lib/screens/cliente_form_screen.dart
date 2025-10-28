import 'package:flutter/material.dart';
import '../models/cliente.dart';
import '../services/cliente_service.dart';

class ClienteFormScreen extends StatefulWidget {
  final Cliente? item;

  const ClienteFormScreen({Key? key, this.item}) : super(key: key);

  @override
  State<ClienteFormScreen> createState() => _ClienteFormScreenState();
}

class _ClienteFormScreenState extends State<ClienteFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  // Controladores para los campos
  final _nombreController = TextEditingController();
  final _correo_electronicoController = TextEditingController();
  final _telefonoController = TextEditingController();
  final _direccionController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.item != null) {
      _loadItemData();
    }
  }

  void _loadItemData() {
    final item = widget.item!;
    _nombreController.text = item.nombre?.toString() ?? '';
    _correo_electronicoController.text = item.correo_electronico?.toString() ?? '';
    _telefonoController.text = item.telefono?.toString() ?? '';
    _direccionController.text = item.direccion?.toString() ?? '';
  }

  @override
  void dispose() {
    _nombreController.dispose();
    _correo_electronicoController.dispose();
    _telefonoController.dispose();
    _direccionController.dispose();
    super.dispose();
  }

  Future<void> _saveItem() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final item = Cliente(
        id: widget.item?.id,
        nombre: _nombreController.text.isEmpty ? null : _nombreController.text,
        correo_electronico: _correo_electronicoController.text.isEmpty ? null : _correo_electronicoController.text,
        telefono: _telefonoController.text.isEmpty ? null : _telefonoController.text,
        direccion: _direccionController.text.isEmpty ? null : _direccionController.text,
      );

      if (widget.item == null) {
        await ClienteService.create(item);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cliente creado correctamente')),
        );
      } else {
        await ClienteService.update(item.id!, item);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cliente actualizado correctamente')),
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
        title: Text(widget.item == null ? 'Nuevo Cliente' : 'Editar Cliente'),
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
              controller: _nombreController,
              decoration: InputDecoration(
                labelText: 'Nombre',
                border: const OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Este campo es requerido';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _correo_electronicoController,
              decoration: InputDecoration(
                labelText: 'Correo_electronico',
                border: const OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Este campo es requerido';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _telefonoController,
              decoration: InputDecoration(
                labelText: 'Telefono',
                border: const OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) return 'Este campo es requerido';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _direccionController,
              decoration: InputDecoration(
                labelText: 'Direccion',
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