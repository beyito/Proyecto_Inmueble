from rest_framework import serializers
from .models import Usuario, Cliente, Agente   


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'nombre', 'correo', 'telefono', 'idRol', 'password']


class ClienteSerializer(serializers.ModelSerializer):
    ubicacion = serializers.CharField(write_only=True, required=False)  # campo extra solo para el serializer

    class Meta:
        model = Usuario
        fields = ['username', 'nombre', 'correo', 'telefono', 'ubicacion', 'password', 'idRol']

    def create(self, validated_data):
        ubicacion = validated_data.pop('ubicacion', None)
        usuario = Usuario.objects.create(**validated_data)
        usuario.set_password(validated_data['password'])
        usuario.save()
        if ubicacion:
            Cliente.objects.create(idUsuario=usuario, ubicacion=ubicacion)
        return usuario
    
    def update(self, instance, validated_data):
        # Actualizar campos de Usuario (PATCH → solo si vienen en el request)
        instance.username = validated_data.get('username', instance.username)
        instance.nombre   = validated_data.get('nombre', instance.nombre)
        instance.correo   = validated_data.get('correo', instance.correo)
        instance.telefono = validated_data.get('telefono', instance.telefono)

        # Manejo de password de forma segura
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)

        instance.save()

        if 'ubicacion' in validated_data:
            ubicacion = validated_data.get('ubicacion')
            cliente, _ = Cliente.objects.get_or_create(idUsuario=instance)
            cliente.ubicacion = ubicacion
            cliente.save()

        return instance

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

    def update(self, instance, validated_data):
        # Actualizar campos de Usuario
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.correo = validated_data.get('correo', instance.correo)
        instance.telefono = validated_data.get('telefono', instance.telefono)
        password = validated_data.get('password', None)
        if password:
            instance.password = password
        instance.save()

        # Actualizar campos de Agente
        if hasattr(instance, 'agente'):
            instance.agente.numero_licencia = validated_data.get('numero_licencia', instance.agente.numero_licencia)
            instance.agente.experiencia = validated_data.get('experiencia', instance.agente.experiencia)
            instance.agente.save()

        return instance
    