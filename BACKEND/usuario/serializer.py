from rest_framework import serializers

from .models import Usuario, Cliente, Agente ,Rol


class UsuarioSerializer(serializers.ModelSerializer):
    rolNombre = serializers.CharField(source='idRol.nombre', read_only=True)
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'nombre', 'correo', 'telefono', 'idRol','ci', 'rolNombre', 'password']


class ClienteSerializer(serializers.ModelSerializer):
    ubicacion = serializers.CharField(write_only=True, required=False)  # campo extra solo para el serializer

    class Meta:
        model = Usuario
        fields = ['username', 'nombre', 'correo', 'telefono', 'ci', 'ubicacion', 'password', 'idRol']

    def create(self, validated_data):
        ubicacion = validated_data.pop('ubicacion', None)
        usuario = Usuario.objects.create(**validated_data)
        usuario.set_password(validated_data['password'])
        usuario.save()
        if ubicacion:
            Cliente.objects.create(idUsuario=usuario, ubicacion=ubicacion)
        return usuario


class AgenteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    numero_licencia = serializers.CharField(write_only=True, required = False)
    experiencia = serializers.IntegerField(write_only=True, required = False)

    class Meta:
        model = Usuario
        fields = ['username', 'nombre', 'correo', 'telefono', 'password', 'idRol', 'numero_licencia', 'experiencia']

    def create(self, validated_data):
        numero_licencia = validated_data.pop('numero_licencia', None)
        experiencia = validated_data.pop('experiencia', None)
        usuario = Usuario.objects.create(**validated_data)
        usuario.set_password(validated_data['password'])
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
        fields = ["idRol", "nombre", "created_at", "updated_at"]  