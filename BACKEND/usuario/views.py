from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view,authentication_classes,permission_classes 
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from .serializer import UsuarioSerializer, ClienteSerializer, AgenteSerializer, PasswordResetRequestSerializer, PasswordResetVerifyCodeSerializer, SetNewPasswordSerializer
from django.core.mail import send_mail
from django.contrib.auth.models import User
from .models import PasswordResetCode, Usuario, Cliente, Agente, PasswordResetCode
from rest_framework.views import APIView
from django.conf import settings

# Create your views here.

@api_view(['POST']) 
def login(request):
    try:
        usuario = get_object_or_404(Usuario, username=request.data['username'])
        print(usuario)
    except:
        return Response({
            "status": 2,
            "error": 1,
            "message": "USUARIO NO ENCONTRADO",
            "values": None
        })
    
    if not usuario.check_password(request.data['password']):
        return Response({
            "status": 2,
            "error": 1,
            "message": "CONTRASEÑA INCORRECTA",
            "values": None
        })

    token, created = Token.objects.get_or_create(user=usuario)
    serializer = UsuarioSerializer(instance=usuario)
    return Response({
        "status": 1,
        "error": 0,
        "message": "LOGIN EXITOSO",
        "values": {"token": token.key, "usuario": serializer.data}
    },)


@api_view(['POST']) 
def register(request):
    serializer = ClienteSerializer(data=request.data)
    if serializer.is_valid():
        usuario = ClienteSerializer.create(ClienteSerializer(), validated_data=serializer.validated_data)
        token = Token.objects.create(user=usuario)
        return Response({
            "status": 1,
            "error": 0,
            "message": "REGISTRO EXITOSO",
            "values": {"token": token.key, "user": serializer.data}
        })
    
    return Response({
        "status": 2,
        "error": 1,
        "message": "ERROR EN EL REGISTRO",
        "values": serializer.errors
    })




@api_view(['POST'])
def registerAgente(request):
    serializer = AgenteSerializer(data=request.data)
    if serializer.is_valid():
        usuario = AgenteSerializer.create(AgenteSerializer(), validated_data=serializer.validated_data)
        token = Token.objects.create(user=usuario)
        return Response({
            "status": 1,
            "error": 0,
            "message": "REGISTRO DE AGENTE EXITOSO",
            "values": {"token": token.key, "user": serializer.data}
        })    
    
    return Response({
        "status": 2,
        "error": 1,
        "message": "ERROR EN EL REGISTRO DE AGENTE",
        "values": serializer.errors
    })


@api_view(["GET", "POST"])  
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    data = UsuarioSerializer(user).data
    return Response(data, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@authentication_classes([TokenAuthentication])  # ⬅️ FORZAMOS TokenAuth
@permission_classes([IsAuthenticated])
def update_usuario(request, pk):
    usuario = get_object_or_404(Usuario, pk=pk)
    serializer = UsuarioSerializer(usuario, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({
        "status": 1,
        "error": 0,
        "message": "PERFIL OBTENIDO",
        "values": data
    })

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def mostrarUsuarios(request):
    if not request.user.es_cliente():  
        return Response({
            "status": 2,
            "error": 1,
            "message": "NO TIENES PERMISO PARA VER LOS USUARIOS",
            "values": None
        }, status=status.HTTP_403_FORBIDDEN)
    
    usuarios = Usuario.objects.all()
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response({
        "status": 1,
        "error": 0,
        "message": "USUARIOS OBTENIDOS",
        "values": serializer.data
    })

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'No existe un usuario con este email'}, status=status.HTTP_404_NOT_FOUND)

        # Crear código de recuperación
        reset_code = PasswordResetCode.objects.create(user=user)

        # Enviar correo con el código
        message = f"Hola {user.username}, tu código de recuperación es: {reset_code.code}\nVálido por 15 minutos."
        send_mail(
            subject="Código de recuperación de contraseña",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )

        return Response({'message': 'Se ha enviado un código de recuperación a tu email'})

class PasswordResetVerifyCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetVerifyCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']

        try:
            user = User.objects.get(email=email)
            reset_code = PasswordResetCode.objects.filter(user=user, code=code, is_used=False).last()
            if not reset_code or not reset_code.is_valid():
                return Response({'error': 'Código inválido o expirado'}, status=status.HTTP_400_BAD_REQUEST)

            # Marcar como verificado
            reset_code.is_verified = True
            reset_code.save()

            return Response({'message': 'Código verificado, ya puedes cambiar tu contraseña'})
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class SetNewPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SetNewPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        new_password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
            # Buscar el último código verificado
            reset_code = PasswordResetCode.objects.filter(user=user, is_verified=True, is_used=False).last()
            if not reset_code or not reset_code.is_valid():
                return Response({'error': 'No tienes un código verificado válido'}, status=status.HTTP_400_BAD_REQUEST)

            # Cambiar la contraseña
            user.set_password(new_password)
            user.save()

            # Marcar el código como usado
            reset_code.is_used = True
            reset_code.save()

            return Response({'message': 'Contraseña cambiada con éxito'})
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def actualizarUsuario(request):
    usuario = request.user  # 🔹 usuario autenticado
    rol = getattr(usuario.idRol, 'nombre', None)  # obtenemos el nombre del rol
    usuarioActualizado = UsuarioSerializer(usuario, data=request.data, partial=True)  # inicializamos el serializer
    if rol == "Cliente":
        serializer = ClienteSerializer(usuario, data=request.data, partial=True)
        usuario.set_password(request.data.get('password', usuario.password))  # Actualiza la contraseña si se proporciona
    elif rol == "Agente":
        serializer = AgenteSerializer(usuario, data=request.data, partial=True)
        usuario.set_password(request.data.get('password', usuario.password))  # Actualiza la contraseña si se proporciona
    else:
        return Response({
            "status": 2,
            "error": 1,
            "message": "ROL NO PERMITIDO PARA ACTUALIZACIÓN",
            "values": None
        })
    if usuarioActualizado.is_valid():
        usuarioActualizado.save()  # guarda los cambios en el usuario
    if serializer.is_valid():
        serializer.save()  # llama al update del serializer correspondiente
        return Response({
            "status": 1,
            "error": 0,
            "message": "USUARIO ACTUALIZADO",
            "values": serializer.data
        })

    return Response({
        "status": 2,
        "error": 1,
        "message": "ERROR AL ACTUALIZAR",
        "values": serializer.errors
    })