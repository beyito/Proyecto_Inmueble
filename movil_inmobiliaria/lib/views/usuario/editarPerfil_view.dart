import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:movil_inmobiliaria/config/config.dart';

class EditProfilePage extends StatefulWidget {
  final Map<String, dynamic>? userData;

  const EditProfilePage({super.key, required this.userData});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController usernameController;
  late TextEditingController nombreController;
  late TextEditingController correoController;
  late TextEditingController ciController;
  late TextEditingController telefonoController;

  bool loading = false;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    usernameController = TextEditingController(
      text: widget.userData?['username'],
    );
    nombreController = TextEditingController(text: widget.userData?['nombre']);
    correoController = TextEditingController(text: widget.userData?['correo']);
    ciController = TextEditingController(text: widget.userData?['ci']);
    telefonoController = TextEditingController(
      text: widget.userData?['telefono'],
    );
  }

  Future<void> _updateProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => loading = true);

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token == null) {
      setState(() {
        errorMessage = "No hay token guardado";
        loading = false;
      });
      return;
    }

    final response = await http.put(
      Uri.parse('${Config.baseUrl}/usuario/editarUsuario'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token $token',
      },
      body: jsonEncode({
        "username": usernameController.text,
        "nombre": nombreController.text,
        "correo": correoController.text,
        "telefono": telefonoController.text,
        "ci": ciController.text,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      Navigator.pop(context, data["values"]); // regresar datos actualizados
    } else {
      setState(() {
        errorMessage = "Error al actualizar perfil (${response.statusCode})";
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Editar perfil")),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: ListView(
                  children: [
                    _buildTextField("Usuario", usernameController),
                    const SizedBox(height: 16),
                    _buildTextField("Nombre completo", nombreController),
                    const SizedBox(height: 16),
                    _buildTextField(
                      "Correo",
                      correoController,
                      keyboard: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      "CI",
                      ciController,
                      keyboard: TextInputType.number,
                    ),
                    const SizedBox(height: 16),
                    _buildTextField(
                      "Teléfono",
                      telefonoController,
                      keyboard: TextInputType.phone,
                    ),
                    const SizedBox(height: 24),
                    if (errorMessage != null)
                      Text(
                        errorMessage!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ElevatedButton(
                      onPressed: _updateProfile,
                      child: const Text("Guardar cambios"),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildTextField(
    String label,
    TextEditingController controller, {
    TextInputType keyboard = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboard,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
      validator: (value) =>
          (value == null || value.isEmpty) ? "Campo obligatorio" : null,
    );
  }
}
