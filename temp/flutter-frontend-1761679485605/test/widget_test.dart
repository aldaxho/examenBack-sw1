import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:cliente/main.dart';

void main() {
  testWidgets('App starts and shows home screen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that the home screen is displayed
    expect(find.text('Sistema Empresarial'), findsOneWidget);
  });
}