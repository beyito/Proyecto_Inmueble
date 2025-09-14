from rest_framework import serializers

from .models import Usuario, Cliente, Agente, Rol  


class UsuarioSerializer(serializers.ModelSerializer):
    rolNombre = serializers.CharField(source='idRol.nombre', read_only=True)
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'nombre', 'correo', 'telefono', 'idRol','ci', 'rolNombre', 'password']


class ClienteSerializer(serializers.ModelSerializer):
    ubicacion = serializers.CharField(write_only=True, required=False)  # campo extra solo para el serializer

    class Meta:
        model = Usuario
        fields = ['username', 'nombre', 'correo', 'telefono', 'ubicacion', 'password', 'ubicacion']

    def create(self, validated_data):
        validated_data['idRol'] = Rol.objects.get(idRol=2)  # Asignar el rol de Cliente automáticamente
        print(validated_data)
        ubicacion = validated_data.pop('ubicacion', None)
        usuario = Usuario.objects.create(**validated_data)
        usuario.set_password(validated_data['password'])
        usuario.save()
        if ubicacion:
            Cliente.objects.create(idUsuario=usuario, ubicacion=ubicacion)
        else: Cliente.objects.create(idUsuario=usuario)
        return usuario
    
    def update(self, instance, validated_data):
        # Actualizar campos de Usuario
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.correo = validated_data.get('correo', instance.correo)
        instance.telefono = validated_data.get('telefono', instance.telefono)
        instance.ci = validated_data.get('ci', instance.ci)
        password = validated_data.get('password', None)
        if password:
            self.password = password
            instance.set_password(self.password)
        instance.save()

        # Actualizar campos de Agente
        if hasattr(instance, 'cliente'):
            instance.cliente.ubicacion = validated_data.get('ubicacion', instance.cliente.ubicacion)
            instance.cliente.save()

        return instance

class AgenteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    numero_licencia = serializers.CharField(write_only=True, required = False)
    experiencia = serializers.IntegerField(write_only=True, required = False)

    class Meta:
        model = Usuario
        fields = ['username', 'nombre', 'correo', 'telefono', 'password', 'numero_licencia', 'experiencia']

    def create(self, validated_data):
        validated_data['idRol'] = Rol.objects.get(idRol=3)  # Asignar el rol de Agente automáticamente
        numero_licencia = validated_data.pop('numero_licencia', None)
        experiencia = validated_data.pop('experiencia', None)
        usuario = Usuario.objects.create(**validated_data)
        usuario.set_password(validated_data['password'])
        usuario.save()
        if numero_licencia or experiencia is not None:
            if numero_licencia and experiencia is not None:
                Agente.objects.create(idUsuario=usuario, numero_licencia=numero_licencia, experiencia=experiencia)
            elif numero_licencia is not None:
                Agente.objects.create(idUsuario=usuario, numero_licencia=numero_licencia)
            elif experiencia is not None:
                Agente.objects.create(idUsuario=usuario, experiencia=experiencia)
        else: Agente.objects.create(idUsuario=usuario)
        return usuario 

    def update(self, instance, validated_data):
        # Actualizar campos de Usuario

        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.correo = validated_data.get('correo', instance.correo)
        instance.telefono = validated_data.get('telefono', instance.telefono)
        instance.ci = validated_data.get('ci', instance.ci)
        password = validated_data.get('password', None)
        if password:
            self.password = password
            instance.set_password(self.password)
        instance.save()

        # Actualizar campos de Agente
        if hasattr(instance, 'agente'):
            instance.agente.numero_licencia = validated_data.get('numero_licencia', instance.agente.numero_licencia)
            instance.agente.experiencia = validated_data.get('experiencia', instance.agente.experiencia)
            instance.agente.save()

        return instance

# class AgenteSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True)
#     numero_licencia = serializers.CharField(write_only=True, required = False)
#     experiencia = serializers.IntegerField(write_only=True, required = False)

#     class Meta:
#         model = Usuario
#         fields = ['username', 'nombre', 'correo', 'telefono', 'password','ci','idRol','rolNombre','numero_licencia', 'experiencia']

#     def create(self, validated_data):
#         numero_licencia = validated_data.pop('numero_licencia', None)
#         experiencia = validated_data.pop('experiencia', None)
#         usuario = Usuario.objects.create(**validated_data)
#         usuario.set_password(validated_data['password'])
#         usuario.save()
#         if numero_licencia and experiencia is not None:
#             Agente.objects.create(idUsuario=usuario, numero_licencia=numero_licencia, experiencia=experiencia)
#         return usuario

#     def update(self, instance, validated_data):
#         # Actualizar campos de Usuario

#         instance.nombre = validated_data.get('nombre', instance.nombre)
#         instance.correo = validated_data.get('correo', instance.correo)
#         instance.telefono = validated_data.get('telefono', instance.telefono)
#         instance.ci = validated_data.get('ci', instance.ci)
#         password = validated_data.get('password', None)
#         if password:
#             self.password = password
#             instance.set_password(self.password)
#         instance.save()

#         # Actualizar campos de Agente
#         if hasattr(instance, 'agente'):
#             instance.agente.numero_licencia = validated_data.get('numero_licencia', instance.agente.numero_licencia)
#             instance.agente.experiencia = validated_data.get('experiencia', instance.agente.experiencia)
#             instance.agente.save()

#         return instance

class PasswordResetRequestSerializer(serializers.Serializer):
    correo = serializers.EmailField()


class PasswordResetVerifyCodeSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    code = serializers.CharField(max_length=6)


class SetNewPasswordSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
