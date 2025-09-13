class UsuarioModel {
  final int? id;
  final String? username;
  final String? nombre;
  final String? correo;
  final String? telefono;
  final int? idRol;
  final String? rolNombre;
  final String? ci;

  UsuarioModel({
    this.id,
    this.username,
    this.nombre,
    this.correo,
    this.telefono,
    this.idRol,
    this.rolNombre,
    this.ci,
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
      rolNombre: usuario['rolNombre'] ?? "",
      ci: usuario['ci'] ?? "",
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'username': username,
    'nombre': nombre,
    'correo': correo,
    'idRol': idRol,
    'rolNombre': rolNombre,
    'telefono': telefono,
    'ci': ci,
  };
}
