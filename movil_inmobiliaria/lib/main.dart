import 'package:flutter/material.dart';
import 'package:movil_inmobiliaria/config/router/router.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Inmobiliaria',
      debugShowCheckedModeBanner: false,
      routerConfig: appRouter,
    );
  }
}
