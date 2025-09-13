import 'package:flutter/material.dart';
import 'package:movil_inmobiliaria/services/auth_service.dart';
import 'package:go_router/go_router.dart';

class LoginPage extends StatefulWidget {
  static const name = 'login-screen';
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final AuthService _authService = AuthService();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = false;
  String _errorMessage = '';

  Future<void> login(BuildContext context) async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });
    try {
      final resAuth = await _authService.login(
        _usernameController.text,
        _passwordController.text,
      );
      if (resAuth.status == 1) {
        // Login exitoso según auth_service.dart
        context.go(
          '/home/1',
        ); //AQUI ES DONDE REDIRIJE AL HOME (0 cero indica el índice de navegación de las tres opciones [Inicio, Categorias, Favoritos])
      } else {
        setState(() {
          _errorMessage = resAuth.error ?? 'Error desconocido';
        });
      }
      // final prefs = await SharedPreferences.getInstance();

      // await prefs.setString('token', resAuth.token ?? '');
      // await prefs.setString('rol', );
      // await prefs.setString('username', );
      // context.go('/home/0');
    } catch (e) {
      print('Error al conectar con el servidor: $e');
      setState(() {
        _errorMessage = 'Error al conectar con el servidor: $e';
      });
    }

    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Iniciar sesión")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _usernameController,
              decoration: const InputDecoration(labelText: "Usuario"),
            ),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: "Contraseña"),
              obscureText: true,
            ),
            const SizedBox(height: 20),
            _isLoading
                ? const CircularProgressIndicator()
                : ElevatedButton(
                    onPressed: () async {
                      await login(context);
                    },
                    child: const Text("Iniciar sesión"),
                  ),
            if (_errorMessage.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 12.0),
                child: Text(
                  _errorMessage,
                  style: const TextStyle(color: Colors.red),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
