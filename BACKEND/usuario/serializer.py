from rest_framework import serializers
from .models import Usuario, Cliente, Agente, Rol

class UsuarioSerializer(serializers.ModelSerializer):
    rolNombre = serializers.CharField(source='idRol.nombre', read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'nombre', 'correo', 'telefono', 'idRol', 'ci', 'rolNombre', 'password']
        extra_kwargs = {
            'idRol': {'read_only': True},  # el cliente no cambia su rol desde aquí
        }


# ⬇⬇⬇ REEMPLAZA COMPLETO POR ESTA VERSIÓN ⬇⬇⬇
class ClienteSerializer(serializers.ModelSerializer):
    ubicacion = serializers.CharField(write_only=True, required=False)
    # permitir que el registro indique el rol; si no viene, se usará "Cliente"
    idRol = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = ['username', 'nombre', 'correo', 'telefono', 'ubicacion', 'password', 'idRol']

    def create(self, validated_data):
        ubicacion = validated_data.pop('ubicacion', None)
        password = validated_data.pop('password')
        idrol_val = validated_data.pop('idRol', None)

        # 1) resolver el Rol a asignar
        rol_obj = None
        if idrol_val is not None:
            try:
                rol_obj = Rol.objects.get(pk=int(idrol_val))
            except (ValueError, Rol.DoesNotExist):
                raise serializers.ValidationError({"idRol": "El rol indicado no existe."})

        if rol_obj is None:
            # por defecto, Cliente
            rol_obj = Rol.objects.filter(nombre__iexact="Cliente").first()
            if not rol_obj:
                raise serializers.ValidationError({"idRol": "No existe el rol 'Cliente'."})

        # 2) crear usuario con ese rol
        usuario = Usuario.objects.create(**validated_data, idRol=rol_obj)
        usuario.set_password(password)
        usuario.save()

        # 3) si es Cliente y vino 'ubicacion', crear su perfil Cliente
        if rol_obj.nombre.lower() == "cliente" and ubicacion:
            Cliente.objects.create(idUsuario=usuario, ubicacion=ubicacion)

        return usuario
# ⬆⬆⬆ REEMPLAZO TERMINA AQUÍ ⬆⬆⬆


class AgenteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    numero_licencia = serializers.CharField(write_only=True, required=False)
    experiencia = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = ['username', 'nombre', 'correo', 'telefono', 'password', 'idRol', 'numero_licencia', 'experiencia']
        extra_kwargs = {
            'idRol': {'read_only': True},
        }

    def create(self, validated_data):
        numero_licencia = validated_data.pop('numero_licencia', None)
        experiencia = validated_data.pop('experiencia', None)
        password = validated_data.pop('password')
        rol_agente, _ = Rol.objects.get_or_create(nombre="Agente")

        usuario = Usuario.objects.create(**validated_data, idRol=rol_agente)
        usuario.set_password(password)
        usuario.save()
        if numero_licencia and experiencia is not None:
            Agente.objects.create(idUsuario=usuario, numero_licencia=numero_licencia, experiencia=experiencia)
        return usuario


class PasswordResetRequestSerializer(serializers.Serializer):
    correo = serializers.EmailField()

class PasswordResetVerifyCodeSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    code = serializers.CharField(max_length=6)

class SetNewPasswordSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ["idRol", "nombre", "created_at", "updated_at"]  # ← usa # para comentar, no //
