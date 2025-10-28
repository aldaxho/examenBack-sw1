const fs = require('fs').promises;
const path = require('path');

/**
 * Función para crear la pantalla principal de Flutter con navegación a todas las entidades
 * @param {string} screensDir - Directorio donde se guardará el archivo
 * @param {Array<string>} entities - Array de nombres de entidades
 * @throws {Error} Si los parámetros no son válidos
 */
async function createHomeScreen(screensDir, entities) {
  // Validación de parámetros
  if (!screensDir || typeof screensDir !== 'string') {
    throw new Error('screensDir es requerido y debe ser una ruta válida');
  }
  
  if (!entities || !Array.isArray(entities) || entities.length === 0) {
    throw new Error('entities es requerido y debe ser un array con al menos una entidad');
  }

  const homeScreenContent = `import 'package:flutter/material.dart';
${entities.map(entity => `import '${entity.toLowerCase()}_list_screen.dart';`).join('\n')}

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sistema Empresarial'),
        centerTitle: true,
        backgroundColor: Colors.black,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
${entities.map(entity => `            _buildModuleCard(
              context: context,
              title: '${entity}',
              icon: Icons.business,
              onTap: () => Navigator.push(
                context,
                PageRouteBuilder(
                  pageBuilder: (_, __, ___) => const ${entity}ListScreen(),
                  transitionsBuilder: (context, animation, secondaryAnimation, child) {
                    return FadeTransition(opacity: animation, child: child);
                  },
                ),
              ),
            ),`).join('\n')}
          ],
        ),
      ),
    );
  }

  Widget _buildModuleCard({
    required BuildContext context,
    required String title,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    final primary = Theme.of(context).colorScheme.primary;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              primary.withOpacity(0.95),
              primary.withOpacity(0.7),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.45),
              blurRadius: 10,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [
                      Colors.white.withOpacity(0.12),
                      Colors.white.withOpacity(0.06),
                    ],
                  ),
                ),
                padding: const EdgeInsets.all(12),
                child: Icon(icon, size: 36, color: Colors.white),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`;

  await fs.writeFile(path.join(screensDir, 'home_screen.dart'), homeScreenContent);
}

module.exports = {
  createHomeScreen
};
