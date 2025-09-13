class UsuarioModel {
  final int? id;
  final String? username;
  final String? nombre;
  final String? email;
  final int? idRol;
  final String? nombreRol;

  UsuarioModel({
    this.id,
    this.username,
    this.nombre,
    this.email,
    this.idRol,
    this.nombreRol,
  });

  factory UsuarioModel.fromJson(Map<String, dynamic> json) {
    return UsuarioModel(
      id: json['id'] ?? 0,
      username: json['username'] ?? "",
      nombre: json['nombre'] ?? "",
      email: json['email'] ?? "",
      idRol: json['idRol'] ?? 0,
      nombreRol: json['nombreRol'] ?? "",
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'username': username,
    'nombre': nombre,
    'email': email,
    'idRol': idRol,
    'nombreRol': nombreRol,
  };
}
