from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view,authentication_classes,permission_classes 
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from .serializer import UsuarioSerializer, ClienteSerializer, AgenteSerializer
from django.contrib.auth.models import User
from .models import Usuario, Cliente, Agente

# Create your views here.

@api_view(['POST']) 
def login(request):
    try:
        usuario = get_object_or_404(Usuario, username=request.data['username'])
    except:
        return Response({"error": "USUARIO NO ENCONTRADO"}, status=status.HTTP_404_NOT_FOUND)
    if not usuario.check_password(request.data['password']):
        return Response({"error": "CONTRASEÑA INCORRECTA"}, status=status.HTTP_400_BAD_REQUEST)

    token, created = Token.objects.get_or_create(user=usuario)
    serializer = UsuarioSerializer(instance = usuario)
    return Response({'token': token.key,"usuario": serializer.data}, status=status.HTTP_200_OK)

@api_view(['POST']) 
def register(request):
    serializer = ClienteSerializer(data=request.data)
    if serializer.is_valid():
        usuario = ClienteSerializer.create(ClienteSerializer(), validated_data=serializer.validated_data)
        token = Token.objects.create(user=usuario)
        return Response({'token': token.key,"user": serializer.data}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def profile(request):
    usuario = UsuarioSerializer(instance = request.user)
    return Response (usuario.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def registerAgente(request):
    serializer = AgenteSerializer(data=request.data)
    if serializer.is_valid():
        usuario = AgenteSerializer.create(AgenteSerializer(), validated_data=serializer.validated_data)
        token = Token.objects.create(user=usuario)
        return Response({'token': token.key,"user": serializer.data}, status=status.HTTP_201_CREATED)    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "POST"])  # acepta ambos para no fallar por método
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    data = UsuarioSerializer(user).data
    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def mostrarUsuarios(request):
    print(request.user.idRol)
    if not request.user.es_cliente():  # Verifica si el usuario no es administrador
        return Response({"error": "No tienes permiso para ver los usuarios."}, status=status.HTTP_403_FORBIDDEN)
    
    usuarios = Usuario.objects.all()
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)