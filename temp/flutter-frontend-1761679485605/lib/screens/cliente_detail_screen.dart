import 'package:flutter/material.dart';
import '../models/cliente.dart';
import 'cliente_form_screen.dart';

class ClienteDetailScreen extends StatelessWidget {
  final Cliente item;

  const ClienteDetailScreen({Key? key, required this.item}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Detalle de Cliente'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ClienteFormScreen(item: item),
                ),
              );
              if (result == true) {
                Navigator.of(context).pop(true);
              }
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Información de Cliente',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 16),
                    _buildDetailRow('ID', item.id?.toString() ?? 'N/A'),
                    _buildDetailRow('Nombre', item.nombre?.toString() ?? 'N/A'),
                    _buildDetailRow('Correo_electronico', item.correo_electronico?.toString() ?? 'N/A'),
                    _buildDetailRow('Telefono', item.telefono?.toString() ?? 'N/A'),
                    _buildDetailRow('Direccion', item.direccion?.toString() ?? 'N/A'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }
}