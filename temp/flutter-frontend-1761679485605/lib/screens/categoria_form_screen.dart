import 'package:flutter/material.dart';
import '../models/categoria.dart';
import '../services/categoria_service.dart';

class CategoriaFormScreen extends StatefulWidget {
  final Categoria? item;

  const CategoriaFormScreen({Key? key, this.item}) : super(key: key);

  @override
  State<CategoriaFormScreen> createState() => _CategoriaFormScreenState();
}

class _CategoriaFormScreenState extends State<CategoriaFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  // Controladores para los campos
  final _nombreController = TextEditingController();

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
  }

  @override
  void dispose() {
    _nombreController.dispose();
    super.dispose();
  }

  Future<void> _saveItem() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final item = Categoria(
        id: widget.item?.id,
        nombre: _nombreController.text.isEmpty ? null : _nombreController.text,
      );

      if (widget.item == null) {
        await CategoriaService.create(item);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Categoria creado correctamente')),
        );
      } else {
        await CategoriaService.update(item.id!, item);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Categoria actualizado correctamente')),
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
        title: Text(widget.item == null ? 'Nuevo Categoria' : 'Editar Categoria'),
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
          ],
        ),
      ),
    );
  }
}