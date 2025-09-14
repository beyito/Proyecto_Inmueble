from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view,authentication_classes,permission_classes 
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from .serializer import UsuarioSerializer, ClienteSerializer, AgenteSerializer, PasswordResetRequestSerializer, PasswordResetVerifyCodeSerializer, SetNewPasswordSerializer,Rol,RolSerializer
from django.core.mail import send_mail
from django.contrib.auth.models import User
from .models import PasswordResetCode, Usuario, Cliente, Agente, PasswordResetCode
from rest_framework.views import APIView
from django.conf import settings
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.lib import colors
from django.http import HttpResponse
from .permissions import IsAdminRole, IsSuperUser
import os
import io
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
    serializer = ClienteSerializer(data=request.data)          # ← sin setear idRol
    if serializer.is_valid():
        usuario = serializer.save()                            # ← usa create del serializer (rol fijo)
        token = Token.objects.create(user=usuario)
        return Response({
            "status": 1,
            "error": 0,
            "message": "REGISTRO EXITOSO",
            "values": {"token": token.key, "user": UsuarioSerializer(usuario).data}
        })
    ...




@api_view(['POST'])
def registerAgente(request):
    serializer = AgenteSerializer(data=request.data)           # ← sin setear idRol
    if serializer.is_valid():
        usuario = serializer.save()                            # ← usa create del serializer (rol fijo)
        token = Token.objects.create(user=usuario)
        return Response({
            "status": 1,
            "error": 0,
            "message": "REGISTRO DE AGENTE EXITOSO",
            "values": {"token": token.key, "user": UsuarioSerializer(usuario).data}
        })    
    ...


@api_view(["GET", "POST"])  
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    data = UsuarioSerializer(user).data
    return Response(data, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_usuario(request, pk):
    usuario = get_object_or_404(Usuario, pk=pk)

    # ✅ Sólo el dueño o un Admin pueden editar
    if (request.user.id != usuario.id) and (not request.user.es_admin()):
        return Response(
            {"detail": "No tienes permiso para actualizar este usuario."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = UsuarioSerializer(usuario, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def mostrarUsuarios(request):
    if not request.user.es_admin():    # ← ahora solo Admin lista
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


class ContratoAgenteView(APIView):
    def post(self, request):
        data = request.data

        # Ruta del archivo de plantilla
        plantilla_path = os.path.join(settings.BASE_DIR, "usuario/contratoPDF/contrato_agente.txt")
        with open(plantilla_path, "r", encoding="utf-8") as f:
            contrato_text = f.read()

        # Reemplazar variables
        contrato_text = contrato_text.format(
            ciudad=data.get("ciudad", "________________"),
            fecha=data.get("fecha", "____/____/______"),
            inmobiliaria_nombre=data.get("inmobiliaria_nombre", "________________"),
            inmobiliaria_direccion=data.get("inmobiliaria_direccion", "________________"),
            inmobiliaria_representante=data.get("inmobiliaria_representante", "________________"),
            agente_nombre=data.get("agente_nombre", "________________"),
            agente_direccion=data.get("agente_direccion", "________________"),
            agente_ci=data.get("agente_ci", "________________"),
            agente_licencia=data.get("agente_licencia", "________________"),
            comision=data.get("comision", "____"),
            duracion=data.get("duracion", "____"),
        )

        # Crear buffer en memoria
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=LETTER,
            rightMargin=50,
            leftMargin=50,
            topMargin=50,
            bottomMargin=50
        )

        # Estilos
        styles = getSampleStyleSheet()
        titulo_style = ParagraphStyle(
            'Titulo',
            fontSize=18,
            leading=22,
            alignment=TA_CENTER,
            spaceAfter=20,
            textColor=colors.darkblue,
        )
        clausula_style = ParagraphStyle(
            'Clausula',
            fontSize=12,
            leading=18,
            alignment=TA_JUSTIFY,
        )
        firma_style = ParagraphStyle(
            'Firma',
            fontSize=12,
            leading=6,
            alignment=TA_CENTER,
        )

        story = []

        # Título
        story.append(Paragraph("CONTRATO DE VINCULACIÓN INMOBILIARIA", titulo_style))
        story.append(Spacer(1, 10))

        # Separar por párrafos usando doble salto de línea
        lineas = contrato_text.strip().split("\n\n")

        # Última línea que dice "Las partes aceptan..."
        aceptacion_texto = lineas[-1]
        clausulas = lineas[:-1]

        # Agregar cláusulas con separador
        for i, p in enumerate(clausulas):
            story.append(Paragraph(p.strip(), clausula_style))
            if i != len(clausulas) - 1:
                story.append(Spacer(1, 6))
                story.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
                story.append(Spacer(1, 6))

        # Frase de aceptación
        story.append(Spacer(1, 6))
        story.append(Paragraph(aceptacion_texto.strip(), clausula_style))
        # Firmas compactas
        firmas_texto = f"""__________________________  <br/><br/><br/>
        INMOBILIARIA ({data.get('inmobiliaria_nombre','________')})<br/><br/>
        __________________________  <br/><br/><br/>
        AGENTE INMOBILIARIO ({data.get('agente_nombre','________')})
        """
        story.append(Paragraph(firmas_texto, firma_style))

        # Generar PDF
        doc.build(story)
        buffer.seek(0)

        # Devolver PDF
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="contrato_{data.get("agente_nombre","agente")}.pdf"'
        return response


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        correo = serializer.validated_data['correo']

        try:
            user = Usuario.objects.get(correo=correo)
        except Usuario.DoesNotExist:
            return Response({
                "status": 2,
                "error": 1,
                "message": "USUARIO NO ENCONTRADO",
                "values": None
            }, status=status.HTTP_404_NOT_FOUND)

        # Crear código de recuperación
        reset_code = PasswordResetCode.objects.create(user=user)

        # Enviar correo con el código
        message = f"Hola {user.username}, tu código de recuperación es: {reset_code.code}\nVálido por 15 minutos."
        send_mail(
            subject="Código de recuperación de contraseña",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.correo],
        )

        return Response({
            "status": 1,
            "error": 0,
            "message": "CÓDIGO DE RECUPERACIÓN ENVIADO",
            "values": {"correo": user.correo}
        })


class PasswordResetVerifyCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetVerifyCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        correo = serializer.validated_data['correo']
        code = serializer.validated_data['code']

        try:
            user = Usuario.objects.get(correo=correo)
            reset_code = PasswordResetCode.objects.filter(user=user, code=code, is_used=False).last()
            if not reset_code or not reset_code.is_valid():
                return Response({
                    "status": 2,
                    "error": 1,
                    "message": "CÓDIGO INVÁLIDO O EXPIRADO",
                    "values": None
                }, status=status.HTTP_400_BAD_REQUEST)

            # Marcar como verificado
            reset_code.is_verified = True
            reset_code.save()

            return Response({
                "status": 1,
                "error": 0,
                "message": "CÓDIGO VERIFICADO, YA PUEDES CAMBIAR TU CONTRASEÑA",
                "values": {"correo": user.correo, "code": reset_code.code}
            })
        except Usuario.DoesNotExist:
            return Response({
                "status": 2,
                "error": 1,
                "message": "USUARIO NO ENCONTRADO",
                "values": None
            }, status=status.HTTP_404_NOT_FOUND)


class SetNewPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SetNewPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        correo = serializer.validated_data['correo']
        new_password = serializer.validated_data['password']

        try:
            user = Usuario.objects.get(correo=correo)
            # Buscar el último código verificado
            reset_code = PasswordResetCode.objects.filter(user=user, is_verified=True, is_used=False).last()
            if not reset_code or not reset_code.is_valid():
                return Response({
                    "status": 2,
                    "error": 1,
                    "message": "NO TIENES UN CÓDIGO VERIFICADO VÁLIDO",
                    "values": None
                }, status=status.HTTP_400_BAD_REQUEST)

            # Cambiar la contraseña
            user.set_password(new_password)
            user.save()

            # Marcar el código como usado
            reset_code.is_used = True
            reset_code.save()

            return Response({
                "status": 1,
                "error": 0,
                "message": "CONTRASEÑA CAMBIADA CON ÉXITO",
                "values": {"correo": user.correo}
            })
        except Usuario.DoesNotExist:
            return Response({
                "status": 2,
                "error": 1,
                "message": "USUARIO NO ENCONTRADO",
                "values": None
            }, status=status.HTTP_404_NOT_FOUND)


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
def _count_admins():
    try:
        admin_rol = Rol.objects.get(nombre="Administrador")
    except Rol.DoesNotExist:
        return 0
    return Usuario.objects.filter(idRol=admin_rol).count()
@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated, IsAdminRole])
def roles_list_create(request):
    if request.method == 'GET':
        roles = Rol.objects.all().order_by('idRol')
        return Response(RolSerializer(roles, many=True).data)
    # POST
    nombre = request.data.get("nombre", "").strip()
    if not nombre:
        return Response({"detail": "nombre es requerido"}, status=400)
    rol, created = Rol.objects.get_or_create(nombre=nombre)
    return Response(RolSerializer(rol).data, status=201 if created else 200)

@api_view(['PATCH', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated, IsAdminRole])
def roles_update_delete(request, idRol):
    rol = get_object_or_404(Rol, pk=idRol)
    if request.method == 'PATCH':
        nombre = request.data.get("nombre", "").strip()
        if not nombre:
            return Response({"detail": "nombre es requerido"}, status=400)
        rol.nombre = nombre
        rol.save(update_fields=["nombre"])
        return Response(RolSerializer(rol).data)
    # DELETE: evita borrar el rol Administrador si hay admins activos
    if rol.nombre == "Administrador" and _count_admins() > 0:
        return Response({"detail": "No puedes borrar el rol 'Administrador' mientras existan admins."}, status=409)
    rol.delete()
    return Response(status=204)
@api_view(['PATCH'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated, IsAdminRole])
def usuarios_set_rol(request, user_id):
    user = get_object_or_404(Usuario, pk=user_id)
    # aceptar idRol o nombre
    idRol = request.data.get("idRol")
    nombre = request.data.get("nombre")
    if idRol is None and not nombre:
        return Response({"detail": "Provee idRol o nombre"}, status=400)
    try:
        rol = Rol.objects.get(pk=idRol) if idRol is not None else Rol.objects.get(nombre=nombre)
    except Rol.DoesNotExist:
        return Response({"detail": "Rol no existe"}, status=404)

    # Evitar dejar el sistema sin admins
    if user.es_admin() and rol.nombre != "Administrador" and _count_admins() == 1:
        return Response({"detail": "No puedes degradar al ÚNICO administrador."}, status=409)

    user.idRol = rol
    user.save(update_fields=["idRol"])
    return Response(UsuarioSerializer(user).data)

@api_view(['PATCH'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated, IsAdminRole])
def usuarios_update_basic(request, user_id):
    """Admin: actualizar datos básicos (nombre, correo, telefono, ci)"""
    user = get_object_or_404(Usuario, pk=user_id)
    allowed = {"nombre", "correo", "telefono", "ci"}
    data = {k: v for k, v in request.data.items() if k in allowed}
    if not data:
        return Response({"detail": "Nada para actualizar."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = UsuarioSerializer(user, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
