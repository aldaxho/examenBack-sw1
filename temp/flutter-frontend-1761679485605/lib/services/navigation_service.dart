import 'package:flutter/material.dart';

class NavigationService {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  static BuildContext? get currentContext => navigatorKey.currentContext;

  static Future<T?> push<T>(Widget page) {
    return navigatorKey.currentState!.push<T>(
      MaterialPageRoute(builder: (context) => page),
    );
  }

  static Future<T?> pushReplacement<T>(Widget page) {
    return navigatorKey.currentState!.pushReplacement<T, dynamic>(
      MaterialPageRoute(builder: (context) => page),
    );
  }

  static void pop<T>([T? result]) {
    navigatorKey.currentState!.pop<T>(result);
  }

  static void popUntil(RoutePredicate predicate) {
    navigatorKey.currentState!.popUntil(predicate);
  }
}