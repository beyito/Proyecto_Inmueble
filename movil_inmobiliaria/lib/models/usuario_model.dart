class UsuarioModel {
  final int? id;
  final String? username;
  final String? nombre;
  final String? correo;
  final String? telefono;
  final int? idRol;

  UsuarioModel({
    this.id,
    this.username,
    this.nombre,
    this.correo,
    this.telefono,
    this.idRol,
  });

  factory UsuarioModel.fromJson(Map<String, dynamic> json) {
    final usuario = json['usuario'] ?? json;
    return UsuarioModel(
      id: usuario['id'] ?? 0,
      username: usuario['username'] ?? "",
      nombre: usuario['nombre'] ?? "",
      correo: usuario['correo'] ?? "",
      telefono: usuario['telefono'] ?? "",
      idRol: usuario['idRol'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'username': username,
    'nombre': nombre,
    'correo': correo,
    'idRol': idRol,
  };
}
