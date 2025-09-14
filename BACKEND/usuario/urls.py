from django.urls import path
from . import views

urlpatterns = [ 
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('profile/', views.profile, name='profile'),
    path('registerAgente/', views.registerAgente, name='registerAgente'),
    path('registerCliente/', views.registerCliente, name='registerCliente'),
    path('<int:pk>/update', views.update_usuario, name='update-usuario'),
    path('recuperacion-codigo-actualizar/', views.SetNewPasswordView.as_view(), name='recuperacion-codigo-actualizar'),
    path('recuperacion-codigo/', views.PasswordResetRequestView.as_view(), name='codigo-recuperacion'),
    path('recuperacion-codigo-confirmar/', views.PasswordResetVerifyCodeView.as_view(), name='recuperacion-codigo-confirmar'),
    path("generarContratoPdf/", views.ContratoAgenteView.as_view(), name="generarContratoPdf"),
    path('registerAdmin/', views.registerAdmin),
    path('editarUsuario', views.actualizarUsuario, name='editarUsuario'),# Editar usuario
    path('roles', views.roles_list_create), #Lista todos los roles (GET) o crea un rol nuevo (POST). Solo para usuarios con rol Administrador.
    path('roles/<int:idRol>', views.roles_update_delete), #Actualiza el nombre de un rol (PATCH) o elimina un rol (DELETE). Impide borrar el rol “Administrador” si aún existe al menos un admin. Solo Administrador.
    path('usuarios/<int:user_id>/set-rol', views.usuarios_set_rol),  #Asigna/cambia el rol de un usuario (acepta idRol o nombre). Evita degradar al único admin que queda. Solo Administrador.
    path('mostrarUsuarios', views.mostrarUsuarios),   # ← AÑADIR
    path('usuarios/<int:user_id>/update-basic', views.usuarios_update_basic),  # ← NUEVA
]


# pasos para recuperar contraseña
#1. /usuario/recuperacion-codigo/
# {
#   "email": "sebas@gmail.com"
# }
#
#2. /usuario/recuperacion-codigo-confirmar/
# {
#   "email": "sebas@gmail.com",
#   "code": "(codigo enviado al email)"
# }
#
#3. /usuario/recuperacion-codigo-actualizar/
# {
#   "email": "sebas@gmail.com",
#   "password": "123456"
# }